export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const username = String(req.query.username || '').toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (!username || username.length < 3 || username.length > 32) {
    return res.status(400).json({ ok: false, error: 'invalid' });
  }

  const token = process.env.TG_BOT_TOKEN;

  // Каскад 1: Bot API getChat (надёжно, работает с любого сервера)
  if (token) {
    try {
      const r = await fetch(`https://api.telegram.org/bot${token}/getChat?chat_id=@${username}`, {
        signal: AbortSignal.timeout(10000)
      });
      const data = await r.json();
      if (data.ok) return res.json({ ok: true, taken: true, method: 'api' });
      // чат не найден или имя некорректное — считаем свободным
      return res.json({ ok: true, taken: false, method: 'api' });
    } catch (e) {
      // падаем на каскад 2
    }
  }

  // Каскад 2: парсинг страницы t.me (не всегда доступен из дата-центра)
  try {
    const r = await fetch(`https://t.me/${username}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(10000)
    });
    if (r.status === 404) return res.json({ ok: true, taken: false, method: 'web' });
    const html = await r.text();
    if (r.status !== 200) return res.json({ ok: true, taken: false, method: 'web' });

    // Занятый (публичный) канал/пользователь: og:title содержит имя.
    // Свободный: t.me отдаёт дефолтный плейсхолдер.
    const m = html.match(/<meta property="og:title" content="([^"]*)"/);
    const title = m ? m[1] : '';
    const hasFake = !title || /Telegram|context|мессендж|спам|заблокирован|nofound/i.test(title);
    return res.json({ ok: true, taken: !hasFake, method: 'web' });
  } catch (e) {
    // Если t.me недоступен — не можем проверить (особый случай)
    return res.json({ ok: true, taken: null, method: 'unavailable', error: e.message });
  }
}