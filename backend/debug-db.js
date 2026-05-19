require('dotenv').config({ path: '../.env' });
require('dotenv').config({ path: './.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    const email = 'admin@example.com';
    console.log(`Querying admins for: ${email}`);
    const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .single();
    
    if (error) {
        console.error('Supabase Error:', error);
        console.error('Message:', error.message);
        console.error('Details:', error.details);
        console.error('Hint:', error.hint);
        console.error('Code:', error.code);
    } else {
        console.log('Success:', data);
    }
}

debug();
