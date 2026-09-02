import { v2 as cloudinary } from 'cloudinary';

const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

if (cloudinaryConfig.cloud_name && cloudinaryConfig.api_key && cloudinaryConfig.api_secret) cloudinary.config(cloudinaryConfig);

function assertCloudinaryConfigured() {
  if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) throw new Error('CLOUDINARY_NOT_CONFIGURED');
}

export async function uploadStudentPhoto(buffer: Buffer, studentId: string) {
  assertCloudinaryConfigured();
  return new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: `m-core/students/${studentId}`, public_id: 'profile', resource_type: 'image', overwrite: true, transformation: [{ width: 600, height: 600, crop: 'fill', gravity: 'face', quality: 'auto', fetch_format: 'auto' }] }, (error, result) => {
      if (error || !result) return reject(error ?? new Error('CLOUDINARY_UPLOAD_FAILED'));
      resolve({ secure_url: result.secure_url, public_id: result.public_id });
    });
    stream.end(buffer);
  });
}

export async function deleteStudentPhoto(publicId: string) {
  assertCloudinaryConfigured();
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
}