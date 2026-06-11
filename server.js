const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// CONFIGURATION — edit these values
// ============================================================
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sm';
const RSVP_FILE = path.join(process.env.RSVP_DATA_DIR || __dirname, 'rsvps.json');
// ============================================================

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper: read RSVPs
function readRsvps() {
  try {
    const data = fs.readFileSync(RSVP_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return { rsvps: [] };
  }
}

// Helper: write RSVPs
function writeRsvps(data) {
  fs.writeFileSync(RSVP_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ─── POST /api/rsvp ─────────────────────────────────────────
// Submit a new RSVP
app.post('/api/rsvp', (req, res) => {
  const { name, phone, attending, guestCount, message } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Please provide a valid name.' });
  }
  if (typeof attending !== 'boolean') {
    return res.status(400).json({ error: 'Please indicate whether you are attending.' });
  }

  const data = readRsvps();

  // Check for duplicate name (case-insensitive)
  const existing = data.rsvps.find(
    (r) => r.name.toLowerCase() === name.trim().toLowerCase()
  );

  const entry = {
    id: existing ? existing.id : uuidv4(),
    name: name.trim(),
    phone: phone ? phone.trim() : '',
    attending,
    guestCount: attending ? Math.max(1, parseInt(guestCount) || 1) : 0,
    message: message ? message.trim() : '',
    timestamp: new Date().toISOString(),
    updated: !!existing,
  };

  if (existing) {
    // Update existing RSVP
    data.rsvps = data.rsvps.map((r) => (r.id === existing.id ? entry : r));
  } else {
    data.rsvps.push(entry);
  }

  writeRsvps(data);
  res.json({ success: true, updated: !!existing, entry });
});

// ─── GET /api/admin/rsvps ───────────────────────────────────
// Get all RSVPs (protected by password)
app.get('/api/admin/rsvps', (req, res) => {
  const pwd = req.headers['x-admin-password'];
  if (pwd !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const data = readRsvps();
  const attending = data.rsvps.filter((r) => r.attending);
  const notAttending = data.rsvps.filter((r) => !r.attending);
  const totalGuests = attending.reduce((sum, r) => sum + (r.guestCount || 1), 0);

  res.json({
    summary: {
      total: data.rsvps.length,
      attending: attending.length,
      notAttending: notAttending.length,
      totalGuests,
    },
    rsvps: data.rsvps.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
  });
});

// ─── DELETE /api/admin/rsvp/:id ─────────────────────────────
// Delete an RSVP (protected by password)
app.delete('/api/admin/rsvp/:id', (req, res) => {
  const pwd = req.headers['x-admin-password'];
  if (pwd !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const data = readRsvps();
  const before = data.rsvps.length;
  data.rsvps = data.rsvps.filter((r) => r.id !== req.params.id);

  if (data.rsvps.length === before) {
    return res.status(404).json({ error: 'RSVP not found' });
  }

  writeRsvps(data);
  res.json({ success: true });
});

// Serve admin page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Serve index for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🌸 Wedding invitation server running!`);
  console.log(`   Invitation: http://localhost:${PORT}`);
  console.log(`   Admin panel: http://localhost:${PORT}/admin`);
  console.log(`   Admin password: ${ADMIN_PASSWORD}\n`);
});
