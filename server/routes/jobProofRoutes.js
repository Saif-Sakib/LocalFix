// server/routes/jobProofRoutes.js
const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { submitProof } = require("../controllers/jobProofController");
const { authenticateToken, authorize } = require('../middleware/auth');

// Multer setup for proof uploads
const proofStorage = () => {
    const uploadPath = path.join(__dirname, `../../uploads/proofs`);
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }
    return multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadPath),
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + path.extname(file.originalname));
        },
    });
};

const upload = multer({ storage: proofStorage() });

// POST route to submit proof
router.post("/", authenticateToken, authorize('worker'), upload.single('image'), submitProof);

module.exports = router;