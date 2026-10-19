import { v2 as cloudinary } from 'cloudinary';

const connectToCloudinary = async (req, res, next) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

/**
 * Streams an in-memory image upload to Cloudinary.
 *
 * multer hands us the file as a buffer (see middlewares/multer.js), so the
 * bytes go straight up the wire instead of through a temp file.
 *
 * @param {Buffer} buffer
 * @returns {Promise<import("cloudinary").UploadApiResponse>}
 */
export const uploadImageBuffer = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(buffer);
  });

export default connectToCloudinary;
