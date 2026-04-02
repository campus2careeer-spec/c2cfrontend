import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('d:/CODING/Campus2Career/vite-project/.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  console.log("Testing login with email harshdeepsingh1554@gmail.com");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'harshdeepsingh1554@gmail.com',
    password: 'Harshu1234',
  });
  if (error) {
    console.error("Login Error:", error.message);
  } else {
    console.log("Login Success! User:", data.user.id);
    
    // Check if profile exists
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (profileErr) {
      console.error("Profile Error:", profileErr.message);
    } else {
      console.log("Profile Found:", profile.role);
    }
  }
}

testLogin();
