const supabase = require('./_lib/supabase');
const { setCors } = require('./_lib/cors');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, email, phone, source, message } = req.body;
  try {
    const leadData = { name, email, phone, source, status: 'new' };
    if (message) leadData.message = message;

    const { error } = await supabase.from('leads').insert([leadData]);
    if (error) throw error;

    res.status(201).json({ message: 'Lead submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error submitting lead' });
  }
};
