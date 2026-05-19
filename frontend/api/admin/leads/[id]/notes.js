const supabase = require('../../../_lib/supabase');
const { setCors } = require('../../../_lib/cors');
const { verifyToken } = require('../../../_lib/auth');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { id } = req.query;
  const { note } = req.body;

  try {
    verifyToken(req);

    const { error } = await supabase.from('notes').insert([{ lead_id: id, note }]);
    if (error) throw error;
    res.status(201).json({ message: 'Note added' });
  } catch (err) {
    if (err.message === 'Unauthorized' || err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid or missing token' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};
