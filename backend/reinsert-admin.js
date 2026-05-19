require('dotenv').config({ path: '../.env' });
require('dotenv').config({ path: './.env' });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const email = 'admin@example.com';
    const password = 'admin123';
    
    console.log('--- Checking if admin exists ---');
    const { data: existing, error: checkError } = await supabase.from('admins').select('*').eq('email', email);
    
    if (checkError) {
        console.error('Check Error:', checkError.message);
    } else if (existing && existing.length > 0) {
        console.log('Admin already exists and is VISIBLE.');
    } else {
        console.log('Admin NOT visible. Attempting to insert...');
        const hashedPassword = await bcrypt.hash(password, 10);
        const { data: inserted, error: insertError } = await supabase
            .from('admins')
            .insert([{ email, password: hashedPassword }])
            .select();
        
        if (insertError) {
            console.error('Insert Error:', insertError.message);
        } else {
            console.log('Insert successful:', inserted);
        }
    }
}

run();
