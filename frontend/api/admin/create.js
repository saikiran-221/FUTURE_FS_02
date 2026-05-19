const bcrypt = require('bcryptjs');
const supabase = require('../_lib/supabase');
const { setCors } = require('../_lib/cors');
const { verifyToken } = require('../_lib/auth');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password } = req.body;

  try {
    verifyToken(req);

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
      .from('admins')
      .insert([{ email, password: hashedPassword }])
      .select('id, email');

    if (error) throw error;
    res.status(201).json({ message: 'Admin created', admin: data[0] });
  } catch (err) {
    if (err.message === 'Unauthorized' || err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid or missing token' });
    }
    console.error('Create Admin Error:', err.message);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};
