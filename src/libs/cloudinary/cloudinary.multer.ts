import multer from 'multer';

// Store files in memory as Buffer
const storage = multer.memoryStorage();
const upload = multer({ storage });

export default upload;