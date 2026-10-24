// Vercel serverless function: /api/behance?url=<behance project url>
// Reads the public page's Open Graph tags so the admin can auto-fill title, description and cover.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=3600');
  try {
    const raw = String(req.query.url || '');
    const u = new URL(raw);
    if (u.protocol !== 'https:' || !/(^|\.)behance\.net$/i.test(u.hostname)) {
      return res.status(400).json({ error: 'Only https://www.behance.net project URLs are allowed.' });
    }
    const idMatch = u.pathname.match(/\/(?:gallery|project)\/(\d+)/);
    if (!idMatch) return res.status(400).json({ error: 'Not a Behance project URL.' });
    const id = idMatch[1];
    const out = { id, embed_url: `https://www.behance.net/embed/project/${id}?ilo0=1`, title: '', description: '', cover_url: '' };
    try {
      const r = await fetch(u.toString(), {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PortfolioBot/1.0)', 'Accept': 'text/html' },
        redirect: 'follow'
      });
      if (r.ok) {
        const html = await r.text();
        const og = p => {
          const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${p}["'][^>]*content=["']([^"']*)["']`, 'i'))
                 || html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${p}["']`, 'i'));
          return m ? m[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'") : '';
        };
        out.title = og('og:title').replace(/\s+on Behance$/i, '');
        out.description = og('og:description');
        out.cover_url = og('og:image');
      } else out.note = `Behance returned ${r.status}; embed link still generated.`;
    } catch (e) { out.note = 'Could not read Behance page; embed link still generated.'; }
    return res.status(200).json(out);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL.' });
  }
}
