import bcrypt from 'bcryptjs';
import { supabase } from './config/supabase.js';

async function createAdmin() {
  const adminData = {
    full_name: 'Admin User',
    email: 'admin@hospital.com',
    password: await bcrypt.hash('admin123', 10), // Change this password
    role: 'admin',
    approval_status: 'approved',
  };

  const { data, error } = await supabase
    .from('users')
    .insert([adminData])
    .select()
    .single();

  if (error) {
    console.error('Error creating admin:', error);
  } else {
    console.log('Admin created successfully!');
    console.log('Email: admin@hospital.com');
    console.log('Password: admin123');
    console.log('\nPlease change the password after first login!');
  }

  process.exit();
}

createAdmin();
