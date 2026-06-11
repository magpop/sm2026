export async function onRequestDelete(context) {
  const { request, env, params } = context;

  const pwd = request.headers.get('x-admin-password');
  if (pwd !== (env.ADMIN_PASSWORD || 'sm'))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await env.DB.prepare(
    'DELETE FROM rsvps WHERE id = ?'
  ).bind(params.id).run();

  if (result.meta.changes === 0)
    return Response.json({ error: 'RSVP not found' }, { status: 404 });

  return Response.json({ success: true });
}
