module.exports = async (req, res) => {
  if (process.env.ACCESS_CODE && req.headers['x-code'] !== process.env.ACCESS_CODE) return res.status(401).end('code');
  const text = String((req.body && req.body.text) || '').slice(0, 600);
  if (!text.trim()) return res.status(400).end('empty');
  const r = await fetch('https://api.fish.audio/v1/tts', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + process.env.FISH_API_KEY,
      'Content-Type': 'application/json',
      model: process.env.FISH_MODEL || 's2-pro'
    },
    body: JSON.stringify({
      text,
      reference_id: process.env.FISH_VOICE_ID || 'ac76ad7ffc79413fbb7f389e7eb9e489',
      format: 'mp3'
    })
  });
  if (!r.ok) return res.status(502).end(await r.text());
  res.setHeader('Content-Type', 'audio/mpeg');
  res.end(Buffer.from(await r.arrayBuffer()));
};
