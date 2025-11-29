import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = 'https://gkrxtudjrsjmqlbyvkct.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

export const uploadFileToSupabase = async (file, folder) => {
  const fileName = `${Date.now()}_${file.originalname}`;
  const filePath = `${folder}/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from(process.env.STORAGE_BUCKET)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(process.env.STORAGE_BUCKET)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
};
