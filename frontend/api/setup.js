const bcrypt = require('bcryptjs');
const supabase = require('./_lib/supabase');
const { setCors } = require('./_lib/cors');

// ONE-TIME SETUP ENDPOINT
// Creates the default admin user in the database if it doesn't already exist.
// Visit: GET /api/setup  — safe to call multiple times (idempotent)
module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Only allow GET for simplicity
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const email = 'admin@example.com';
    const password = 'admin123';

    // Check if admin already exists
    const { data: existing } = await supabase
      .from('admins')
      .select('id, email')
      .eq('email', email)
      .limit(1);

    if (existing && existing.length > 0) {
      return res.json({
        status: 'already_exists',
        message: `Admin "${email}" already exists. Login with password: admin123`,
        admin: existing[0]
      });
    }

    // Create admin
    const hashedPassword = await bcrypt.hash(password, 10);
    const { data: inserted, error } = await supabase
      .from('admins')
      .insert([{ email, password: hashedPassword }])
      .select('id, email');

    if (error) throw error;

    res.status(201).json({
      status: 'created',
      message: `Admin created! Email: ${email} | Password: admin123`,
      admin: inserted[0]
    });
  } catch (err) {
    console.error('Setup Error:', err.message);
    res.status(500).json({
      status: 'error',
      message: err.message,
      hint: 'Make sure SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are set in Vercel Environment Variables.'
    });
  }
};
