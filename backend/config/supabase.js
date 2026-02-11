import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://gkrxtudjrsjmqlbyvkct.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseKey) {
  throw new Error('SUPABASE_KEY is not defined in environment variables');
}

if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  throw new Error('SUPABASE_URL is invalid or not defined');
}

console.log('Initializing Supabase client with URL:', supabaseUrl);

// Create Supabase client with service role key for backend operations
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const uploadFileToSupabase = async (file, folder) => {
  try {
    const bucketName = process.env.STORAGE_BUCKET || 'health';
    const fileName = `${Date.now()}_${file.originalname}`;
    const filePath = `${folder}/${fileName}`;
    
    console.log(`Uploading file to bucket: ${bucketName}, path: ${filePath}`);
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    console.log('File uploaded successfully:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Upload function error:', error);
    throw error;
  }
};
