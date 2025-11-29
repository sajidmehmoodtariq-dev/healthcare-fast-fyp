import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import { uploadFileToSupabase } from '../config/supabase.js';

export const signup = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      role,
      phoneNumber,
      age,
      gender,
      cnic,
      clinicAddress,
      specialization,
      experience,
      licenseNumber,
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate role - admin cannot signup
    if (!['patient', 'doctor'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Only patients and doctors can register.' });
    }

    // Check if CNIC is provided for doctors
    if (role === 'doctor' && !cnic) {
      return res.status(400).json({ error: 'CNIC is required for doctors' });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare user data (using snake_case for database columns)
    const userData = {
      full_name: fullName,
      email,
      password: hashedPassword,
      role,
      phone_number: phoneNumber || null,
      age: age ? parseInt(age) : null,
      gender: gender || null,
      cnic: cnic || null,
    };

    // Add doctor-specific fields and set approval status to pending
    if (role === 'doctor') {
      userData.clinic_address = clinicAddress || null;
      userData.specialization = specialization || null;
      userData.experience = experience ? parseInt(experience) : null;
      userData.license_number = licenseNumber || null;
      userData.approval_status = 'pending'; // Doctor needs admin approval

      // Handle file uploads
      if (req.files) {
        if (req.files.cnicImage && req.files.cnicImage[0]) {
          const cnicImageUrl = await uploadFileToSupabase(req.files.cnicImage[0], 'cnic');
          userData.cnic_image_url = cnicImageUrl;
        }

        if (req.files.degreeImage && req.files.degreeImage[0]) {
          const degreeImageUrl = await uploadFileToSupabase(req.files.degreeImage[0], 'degrees');
          userData.degree_image_url = degreeImageUrl;
        }
      }
    }

    // Insert user into Supabase
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    delete newUser.password;

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    delete user.password;

    res.status(200).json({
      message: 'Login successful',
      user,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove password from response
    delete user.password;

    res.status(200).json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

export const updateDoctorProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      fullName,
      phoneNumber,
      age,
      gender,
      cnic,
      clinicAddress,
      specialization,
      experience,
      licenseNumber,
    } = req.body;

    // Get current user to verify they are a doctor
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError || !currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (currentUser.role !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can update profile' });
    }

    // Check if CNIC and degree images are provided (required for update)
    if (!req.files || !req.files.cnicImage || !req.files.cnicImage[0]) {
      return res.status(400).json({ error: 'CNIC image is required' });
    }

    if (!req.files || !req.files.degreeImage || !req.files.degreeImage[0]) {
      return res.status(400).json({ error: 'Degree image is required' });
    }

    // Upload new images
    const cnicImageUrl = await uploadFileToSupabase(req.files.cnicImage[0], 'cnic');
    const degreeImageUrl = await uploadFileToSupabase(req.files.degreeImage[0], 'degrees');

    // Prepare update data
    const updateData = {
      full_name: fullName || currentUser.full_name,
      phone_number: phoneNumber || currentUser.phone_number,
      age: age ? parseInt(age) : currentUser.age,
      gender: gender || currentUser.gender,
      cnic: cnic || currentUser.cnic,
      clinic_address: clinicAddress || currentUser.clinic_address,
      specialization: specialization || currentUser.specialization,
      experience: experience ? parseInt(experience) : currentUser.experience,
      license_number: licenseNumber || currentUser.license_number,
      cnic_image_url: cnicImageUrl,
      degree_image_url: degreeImageUrl,
      approval_status: 'pending', // Reset to pending after update
      rejection_reason: null, // Clear rejection reason
    };

    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    // Remove password from response
    delete updatedUser.password;

    res.status(200).json({
      message: 'Profile updated successfully. Your account is now pending approval.',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
