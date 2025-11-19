import { createClient } from '@supabase/supabase-js';
import { getDb } from './server/db';
import { users } from './shared/schema';

async function createAdminUser() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
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

  // Upsert user in database with admin role
  console.log('Setting admin role in database...');
  
  try {
    const db = getDb();
    await db.insert(users).values({
      id: authData.user.id,
      email: adminEmail,
      firstName: firstName,
      lastName: lastName,
      authProvider: 'supabase',
      role: 'admin'
    }).onConflictDoUpdate({
      target: users.id,
      set: {
        role: 'admin',
        email: adminEmail,
        firstName: firstName,
        lastName: lastName
      }
    });

    console.log('✅ Admin role assigned in database');
    console.log('\n=== Admin account created successfully ===');
    console.log('Email:', adminEmail);
    console.log('Password: [HIDDEN FOR SECURITY]');
    console.log('Role: admin');
    console.log('==========================================\n');
    
  } catch (dbError) {
    console.error('❌ Error updating database:', dbError);
    process.exit(1);
  }
}

createAdminUser().catch(console.error);
