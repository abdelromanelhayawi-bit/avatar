export default async (req) => {
  const code = Netlify.env.get('ACCESS_CODE');
  if (code && req.headers.get('x-code') !== code) return new Response('code', { status: 401 });
  const body = await req.json().catch(() => ({}));
  const text = String(body.text || '').slice(0, 600);
  if (!text.trim()) return new Response('empty', { status: 400 });
  const r = await fetch('https://api.fish.audio/v1/tts', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + Netlify.env.get('FISH_API_KEY'),
      'Content-Type': 'application/json',
      model: Netlify.env.get('FISH_MODEL') || 's2-pro'
    },
    body: JSON.stringify({
      text,
      reference_id: Netlify.env.get('FISH_VOICE_ID') || 'ac76ad7ffc79413fbb7f389e7eb9e489',
      format: 'mp3'
    })
  });
  if (!r.ok) return new Response(await r.text(), { status: 502 });
  return new Response(await r.arrayBuffer(), { headers: { 'Content-Type': 'audio/mpeg' } });
};
export const config = { path: '/api/tts' };
