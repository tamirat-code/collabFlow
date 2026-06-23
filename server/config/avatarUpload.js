import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req) => {
    

    return {
      folder: 'collabflow/avatars',
      resource_type: 'image',
      public_id: `user-${req.user.id}-${Date.now()}`,
      transformation: [
        {
          width: 256,
          height: 256,
          crop: 'fill',
          gravity: 'face'
        }
      ],
      format: 'jpg',
    };
  },
});

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB — avatars don't need to be huge
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPG, PNG, or WEBP images are allowed for avatars'));
  },
});

export { cloudinary as avatarCloudinary };