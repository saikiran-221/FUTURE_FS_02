const supabase = require('../_lib/supabase');
const { setCors } = require('../_lib/cors');
const { verifyToken } = require('../_lib/auth');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    verifyToken(req);

    const { data: leads, error } = await supabase
      .from('leads')
      .select('*, notes(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(leads);
  } catch (err) {
    if (err.message === 'Unauthorized' || err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid or missing token' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};
