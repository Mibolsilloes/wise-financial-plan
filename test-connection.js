import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Load environment variables
const envContent = fs.readFileSync('.env', 'utf8');
const envVars = envContent.split('\n').reduce((acc, line) => {
  const [key, value] = line.split('=');
  if (key && value) {
    acc[key] = value.replace(/"/g, '');
  }
  return acc;
}, {});

console.log('Testing Supabase connection...');
const supabase = createClient(envVars.VITE_SUPABASE_URL, envVars.VITE_SUPABASE_PUBLISHABLE_KEY);

// Test basic connection
async function testConnection() {
  try {
    console.log('Testing basic query...');
    const { data, error } = await supabase.from('categories').select('count').limit(1);

    if (error) {
      console.error('Connection test failed:', error);
      return false;
    }

    console.log('Connection successful! ✅');
    return true;
  } catch (error) {
    console.error('Connection error:', error);
    return false;
  }
}

// Test authentication
async function testAuth() {
  console.log('Checking current session...');
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Auth error:', error);
    return null;
  }

  if (!session) {
    console.log('No active session found.');
    return null;
  }

  console.log('Active session for:', session.user.email);
  return session.user;
}

async function runTests() {
  const connected = await testConnection();
  if (!connected) {
    console.error('Cannot proceed without database connection');
    return;
  }

  const user = await testAuth();
  if (!user) {
    console.log('No authenticated user. Please log in through the web interface first.');
    console.log('Visit: http://localhost:8082/auth');
    return;
  }

  console.log('Ready to test category and transaction creation!');
  console.log('Please use the web interface at http://localhost:8082 to test the flow.');
}

runTests();