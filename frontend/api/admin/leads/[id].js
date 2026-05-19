const supabase = require('../../_lib/supabase');
const { setCors } = require('../../_lib/cors');
const { verifyToken } = require('../../_lib/auth');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;

  try {
    verifyToken(req);

    if (req.method === 'PATCH') {
      const { status, is_tracked } = req.body;
      const updates = { updated_at: new Date() };
      if (status !== undefined) updates.status = status;
      if (is_tracked !== undefined) updates.is_tracked = is_tracked;

      const { error } = await supabase.from('leads').update(updates).eq('id', id);
      if (error) throw error;
      return res.json({ message: 'Lead updated' });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (err) {
    if (err.message === 'Unauthorized' || err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid or missing token' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};
