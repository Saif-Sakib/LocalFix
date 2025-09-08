const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

/**
 * Factory to create multer storage for different upload types
 */
function makeStorage(folderName) {
    const uploadPath = path.join(__dirname, `../../uploads/${folderName}`);

    // Ensure folder exists
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }

    return multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix =
                Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, uniqueSuffix + path.extname(file.originalname));
        },
    });
}

/**
 * Helper function to return full file URL
 */
function buildFileUrl(req, folderName, filename) {
    const serverUrl =
        process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
    return `${serverUrl}/uploads/${folderName}/${filename}`;
}

/**
 * Route for issue images
 * **--- NEW ROUTE ADDED ---**
 */
const issueUpload = multer({ storage: makeStorage('issue_img') });
router.post('/issue', issueUpload.single('image'), (req, res) => {
    if (!req.file) {
        return res
            .status(400)
            .json({ success: false, message: 'No file uploaded' });
    }

    res.json({
        success: true,
        message: 'Issue image uploaded successfully',
        fileUrl: buildFileUrl(req, 'issue_img', req.file.filename),
    });
});

/**
 * Route for profile pictures
 */
const profileUpload = multer({ storage: makeStorage('profiles') });
router.post('/profile', profileUpload.single('image'), (req, res) => {
    if (!req.file) {
        return res
            .status(400)
            .json({ success: false, message: 'No file uploaded' });
    }

    res.json({
        success: true,
        message: 'Profile picture uploaded successfully',
        fileUrl: buildFileUrl(req, 'profiles', req.file.filename),
    });
});

module.exports = router;