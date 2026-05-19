const { setCors } = require('./_lib/cors');

module.exports = (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  res.json({ message: 'CRM Backend is running normally.' });
};
