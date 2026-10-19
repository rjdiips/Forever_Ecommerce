import multer from "multer";

// Uploads are buffered in memory and streamed straight to Cloudinary, so
// nothing is written to disk: two uploads can no longer collide on the
// original file name, and no temp files are left behind.
const storage = multer.memoryStorage();

const upload = multer({ storage });

export default upload;
