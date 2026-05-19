const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests from Vercel deployments, localhost, and no-origin (curl/Postman)
    const allowed = !origin
      || origin.includes('localhost')
      || origin.includes('vercel.app')
      || origin.includes('onrender.com');
    if (allowed) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));


const supabaseUrl = process.env.SUPABASE_URL;
// Use SERVICE_ROLE_KEY to bypass RLS for admin operations (updates), fallback to ANON_KEY
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'YOUR_SUPABASE_URL') {
    console.error('ERROR: Missing or invalid Supabase environment variables.');
    console.error('Please check your .env file.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const JWT_SECRET = process.env.JWT_SECRET || 'crm_secret_key';

// Health Check / Root route
app.get('/', (req, res) => {
    res.json({ message: 'CRM Backend is running normally.' });
});


// Admin Login
app.post('/api/admin/login', async (req, res) => {
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
            console.log('Admin not found in database');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = (password === admin.password) || await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            console.log('Password mismatch');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log('Login successful');
        const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, admin: { id: admin.id, email: admin.email } });
    } catch (err) {
        console.error('Login Exception:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Lead Submission (Public)
app.post('/api/leads', async (req, res) => {
    const { name, email, phone, source, message } = req.body;
    try {
        const leadData = { name, email, phone, source, status: 'new' };
        if (message) leadData.message = message;

        const { data, error } = await supabase
            .from('leads')
            .insert([leadData]);

        if (error) throw error;
        res.status(201).json({ message: 'Lead submitted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error submitting lead' });
    }
});

// Get All Leads (Admin)
app.get('/api/admin/leads', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(token, JWT_SECRET);
        const { data: leads, error } = await supabase
            .from('leads')
            .select('*, notes(*)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(leads);
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Update Lead Status (Admin)
app.patch('/api/admin/leads/:id', async (req, res) => {
    const { id } = req.params;
    const { status, is_tracked } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(token, JWT_SECRET);

        const updates = { updated_at: new Date() };
        if (status !== undefined) updates.status = status;
        if (is_tracked !== undefined) updates.is_tracked = is_tracked;

        const { data, error } = await supabase
            .from('leads')
            .update(updates)
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Lead updated' });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Create New Admin (Admin only)
app.post('/api/admin/create', async (req, res) => {
    const { email, password } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(token, JWT_SECRET);

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
        console.error('Create Admin Error:', err.message);
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.status(500).json({ message: err.message || 'Server error' });
    }
});

// Add Note to Lead (Admin)
app.post('/api/admin/leads/:id/notes', async (req, res) => {
    const { id } = req.params;
    const { note } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(token, JWT_SECRET);
        const { data, error } = await supabase
            .from('notes')
            .insert([{ lead_id: id, note }]);

        if (error) throw error;
        res.status(201).json({ message: 'Note added' });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
