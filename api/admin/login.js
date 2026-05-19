const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../_lib/supabase');
const { setCors } = require('../_lib/cors');
const { JWT_SECRET } = require('../_lib/auth');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password } = req.body;
  console.log(`Login attempt for: ${email}`);

  try {
    const { data: admins, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .limit(1);

    const admin = admins && admins[0];

    if (error) {
      console.error('Supabase Error:', error.message);
      return res.status(401).json({ message: 'User not found or database error' });
    }

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = (password === admin.password) || await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, admin: { id: admin.id, email: admin.email } });
  } catch (err) {
    console.error('Login Exception:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
