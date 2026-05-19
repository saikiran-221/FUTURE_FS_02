require('dotenv').config({ path: './.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function test() {
    console.log('--- Test 1: Simple leads query ---');
    const { data: leads1, error: e1 } = await supabase.from('leads').select('*').limit(3);
    if (e1) console.error('Error:', e1.message);
    else console.log('Leads count:', leads1.length, '| Sample:', leads1[0] ? Object.keys(leads1[0]) : 'empty');

    console.log('\n--- Test 2: Leads with notes join ---');
    const { data: leads2, error: e2 } = await supabase.from('leads').select('*, notes(*)').limit(3);
    if (e2) console.error('Notes join Error:', e2.message);
    else console.log('Leads with notes OK, count:', leads2.length);
}

test();
