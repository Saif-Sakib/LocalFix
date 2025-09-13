// server/services/uploadService.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Upload Service - Handles all file upload operations and configurations
 * All file access is now API-only for better security and control
 */
class UploadService {
    constructor() {
        this.baseUploadPath = path.join(__dirname, '../../uploads');
        this.serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
        this.allowedImageTypes = /jpeg|jpg|png|gif|webp/;
        this.allowedFolders = ['profiles', 'issue_img', 'proofs'];
    }

    /**
     * Factory to create multer storage for different upload types
     * @param {string} folderName - The folder name within uploads directory
     * @param {string} filePrefix - Optional prefix for filename (default: none)
     * @returns {multer.StorageEngine}
     */
    createStorage(folderName, filePrefix = '') {
        const uploadPath = path.join(this.baseUploadPath, folderName);

        // Ensure folder exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        return multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const prefix = filePrefix ? `${filePrefix}-` : '';
                const userId = req.user?.user_id ? `${req.user.user_id}-` : '';
                cb(null, `${prefix}${userId}${uniqueSuffix}${path.extname(file.originalname)}`);
            },
        });
    }

    /**
     * Create multer upload configuration
     * @param {string} folderName - Folder name for uploads
     * @param {number} fileSizeLimit - File size limit in bytes
     * @param {string} filePrefix - Optional filename prefix
     * @returns {multer.Multer}
     */
    createUploadConfig(folderName, fileSizeLimit = 5 * 1024 * 1024, filePrefix = '') {
        return multer({
            storage: this.createStorage(folderName, filePrefix),
            limits: {
                fileSize: fileSizeLimit,
            },
            fileFilter: this.imageFileFilter.bind(this),
        });
    }

    /**
     * File filter for image files only
     * @param {Object} req - Express request object
     * @param {Object} file - Multer file object
     * @param {Function} cb - Callback function
     */
    imageFileFilter(req, file, cb) {
        const extname = this.allowedImageTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = this.allowedImageTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
        }
    }

    /**
     * Build file URL using API route only
     * @param {string} folderName - Folder name within uploads
     * @param {string} filename - File name
     * @returns {string} Full URL to the file via API
     */
    buildFileUrl(folderName, filename) {
        return `${this.serverUrl}/api/uploads/image/${folderName}/${filename}`;
    }

    /**
     * Validate folder name for security
     * @param {string} folderName - Folder name to validate
     * @returns {boolean} Is valid folder
     */
    isValidFolder(folderName) {
        return this.allowedFolders.includes(folderName);
    }

    /**
     * Delete file from filesystem
     * @param {string} folderName - Folder name within uploads
     * @param {string} filename - File name to delete
     * @returns {boolean} Success status
     */
    deleteFile(folderName, filename) {
        try {
            if (!this.isValidFolder(folderName)) {
                return false;
            }
            
            const filePath = this.getFilePath(folderName, filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting file:', error);
            return false;
        }
    }

    /**
     * Check if file exists
     * @param {string} folderName - Folder name within uploads
     * @param {string} filename - File name to check
     * @returns {boolean} File exists status
     */
    fileExists(folderName, filename) {
        if (!this.isValidFolder(folderName)) {
            return false;
        }
        const filePath = this.getFilePath(folderName, filename);
        return fs.existsSync(filePath);
    }

    /**
     * Get file path
     * @param {string} folderName - Folder name within uploads
     * @param {string} filename - File name
     * @returns {string} Full file path
     */
    getFilePath(folderName, filename) {
        return path.join(this.baseUploadPath, folderName, filename);
    }

    /**
     * List files in a directory
     * @param {string} folderName - Folder name within uploads
     * @returns {Array} Array of filenames
     */
    listFiles(folderName) {
        try {
            if (!this.isValidFolder(folderName)) {
                return [];
            }
            
            const directoryPath = path.join(this.baseUploadPath, folderName);
            if (!fs.existsSync(directoryPath)) {
                return [];
            }
            return fs.readdirSync(directoryPath);
        } catch (error) {
            console.error('Error listing files:', error);
            return [];
        }
    }

    /**
     * Get file stats
     * @param {string} folderName - Folder name within uploads
     * @param {string} filename - File name
     * @returns {Object|null} File stats or null if not found
     */
    getFileStats(folderName, filename) {
        try {
            if (!this.isValidFolder(folderName)) {
                return null;
            }
            
            const filePath = this.getFilePath(folderName, filename);
            if (fs.existsSync(filePath)) {
                return fs.statSync(filePath);
            }
            return null;
        } catch (error) {
            console.error('Error getting file stats:', error);
            return null;
        }
    }

    /**
     * Get content type based on file extension
     * @param {string} extension - File extension
     * @returns {string} Content type
     */
    getContentType(extension) {
        const types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };
        return types[extension.toLowerCase()] || 'application/octet-stream';
    }

    // Predefined upload configurations
    get profileUpload() {
        return this.createUploadConfig('profiles', 5 * 1024 * 1024, 'profile');
    }

    get issueUpload() {
        return this.createUploadConfig('issue_img', 10 * 1024 * 1024);
    }

    get proofUpload() {
        return this.createUploadConfig('proofs', 10 * 1024 * 1024);
    }

    /**
     * Handle multer errors
     * @param {Error} error - The error object
     * @param {Object} res - Express response object
     * @returns {Object} Error response
     */
    handleUploadError(error, res) {
        console.error('Upload error:', error);
        
        if (error instanceof multer.MulterError) {
            if (error.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'File too large. Please check the file size limit.'
                });
            }
            if (error.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).json({
                    success: false,
                    message: 'Too many files uploaded.'
                });
            }
        }

        if (error.message.includes('Only image files are allowed')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Upload error occurred'
        });
    }
}

module.exports = new UploadService();