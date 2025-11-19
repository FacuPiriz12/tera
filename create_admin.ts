import { createClient } from '@supabase/supabase-js';

async function createAdminUser() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    console.error('SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET');
    console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'NOT SET');
    process.exit(1);
  }

  // Create Supabase admin client
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const adminEmail = 'facupiriz87@gmail.com';
  const adminPassword = 'Facupm1227';
  const firstName = 'Facundo';
  const lastName = 'Piriz';

  console.log('Creating admin user in Supabase Auth...');
  
  // First check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find(u => u.email === adminEmail);
  
  let userId: string;
  
  if (existingUser) {
    console.log('ℹ️ User already exists in Supabase Auth:', existingUser.id);
    userId = existingUser.id;
    
    // Update user metadata and password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      existingUser.id,
      {
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName
        }
      }
    );
    
    if (updateError) {
      console.error('⚠️ Warning: Could not update user:', updateError.message);
    } else {
      console.log('✅ User updated in Supabase Auth');
    }
  } else {
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName
      }
    });

    if (authError) {
      console.error('❌ Error creating user in Supabase Auth:', authError.message);
      process.exit(1);
    }

    console.log('✅ User created in Supabase Auth:', authData.user.id);
    userId = authData.user.id;
  }

  console.log('\n=== Admin account ready ===');
  console.log('Email:', adminEmail);
  console.log('Password: [CONFIGURED]');
  console.log('User ID:', userId);
  console.log('Status: Email confirmed');
  console.log('\nℹ️ When you log in for the first time, the system will');
  console.log('   automatically assign the admin role in the database.');
  console.log('===============================\n');
}

createAdminUser().catch(console.error);
