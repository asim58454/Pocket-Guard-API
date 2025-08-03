// src/config/cloudinary.config.ts
import { config as dotenvConfig } from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

// Load .env manually
dotenvConfig();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


console.log('CLOUDINARY CONFIG:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export default cloudinary;
