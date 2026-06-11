export async function onRequestGet(context) {
  const { request, env } = context;

  const pwd = request.headers.get('x-admin-password');
  if (pwd !== (env.ADMIN_PASSWORD || 'sm'))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { results } = await env.DB.prepare(
    'SELECT * FROM rsvps ORDER BY timestamp DESC'
  ).all();

  const rsvps = results.map(r => ({ ...r, attending: r.attending === 1, updated: r.updated === 1 }));
  const attending = rsvps.filter(r => r.attending);
  const totalGuests = attending.reduce((sum, r) => sum + (r.guestCount || 1), 0);

  return Response.json({
    summary: {
      total: rsvps.length,
      attending: attending.length,
      notAttending: rsvps.length - attending.length,
      totalGuests,
    },
    rsvps,
  });
}
