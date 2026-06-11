export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try { body = await request.json(); }
  catch { return Response.json({ error: 'Invalid request.' }, { status: 400 }); }

  const { name, attending, guestCount, message } = body;

  if (!name || typeof name !== 'string' || name.trim().length < 2)
    return Response.json({ error: 'Please provide a valid name.' }, { status: 400 });
  if (typeof attending !== 'boolean')
    return Response.json({ error: 'Please indicate whether you are attending.' }, { status: 400 });

  const trimmedName = name.trim();
  const gc = attending ? Math.max(1, parseInt(guestCount) || 1) : 0;
  const msg = message ? String(message).trim() : '';
  const timestamp = new Date().toISOString();

  const existing = await env.DB.prepare(
    'SELECT id FROM rsvps WHERE LOWER(name) = LOWER(?)'
  ).bind(trimmedName).first();

  const id = existing ? existing.id : crypto.randomUUID();

  if (existing) {
    await env.DB.prepare(
      'UPDATE rsvps SET name=?, attending=?, guestCount=?, message=?, timestamp=?, updated=1 WHERE id=?'
    ).bind(trimmedName, attending ? 1 : 0, gc, msg, timestamp, id).run();
  } else {
    await env.DB.prepare(
      'INSERT INTO rsvps (id, name, attending, guestCount, message, timestamp, updated) VALUES (?, ?, ?, ?, ?, ?, 0)'
    ).bind(id, trimmedName, attending ? 1 : 0, gc, msg, timestamp).run();
  }

  return Response.json({
    success: true,
    updated: !!existing,
    entry: { id, name: trimmedName, attending, guestCount: gc, message: msg, timestamp, updated: !!existing }
  });
}
