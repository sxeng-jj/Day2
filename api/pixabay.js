// Vercel 서버리스 함수: API 키는 환경변수 PIXABAY_API_KEY 에서만 읽는다.
module.exports = async (req, res) => {
  const key = process.env.PIXABAY_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'PIXABAY_API_KEY 환경변수가 설정되지 않았습니다.' });
  }

  const q = String(req.query.q || '').trim();
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  if (!q) return res.status(400).json({ error: '검색어를 입력하세요.' });

  const url = 'https://pixabay.com/api/?' + new URLSearchParams({
    key, q, page, per_page: 10, image_type: 'photo', lang: 'ko', safesearch: 'true'
  });

  try {
    const r = await fetch(url);
    if (!r.ok) return res.status(r.status).json({ error: 'Pixabay 요청 실패 (' + r.status + ')' });
    const data = await r.json();
    res.setHeader('Cache-Control', 's-maxage=300');
    return res.status(200).json({ totalHits: data.totalHits, hits: data.hits });
  } catch (e) {
    return res.status(502).json({ error: '서버 오류: ' + e.message });
  }
};
