const SYSTEM = 'أنت مساعد صوتي ودود اسمك عبدالرحمن. رد بنفس لغة ولهجة المستخدم (لو كلمك بالمصري رد بالمصري)، بجملتين أو ثلاث كحد أقصى كأنك في مكالمة فيديو، وبأسلوب شبابي دافئ، بدون رموز أو قوائم أو إيموجي.';
module.exports = async (req, res) => {
  if (process.env.ACCESS_CODE && req.headers['x-code'] !== process.env.ACCESS_CODE) return res.status(401).end('code');
  const messages = ((req.body && req.body.messages) || []).slice(-12).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content).slice(0, 2000) }));
  if (!messages.length) return res.status(400).end('empty');
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: process.env.CLAUDE_MODEL || 'claude-haiku-5-5', max_tokens: 300, system: SYSTEM, messages })
  });
  const j = await r.json();
  if (!r.ok) return res.status(502).json({ error: j });
  res.json({ reply: (j.content || []).map(c => c.text || '').join('').trim() });
};
