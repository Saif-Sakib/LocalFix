// server/controllers/fileController.js
const uploadService = require('../services/uploadService');
const path = require('path');

/**
 * File Controller - Handles file operations including upload, fetch, and delete
 * Streamlined to use uploadService functions and avoid code duplication
 */
class FileController {

    /**
     * Generic upload handler - reduces code duplication
     * @param {string} folder - Upload folder type
     * @param {string} message - Success message
     */
    createUploadHandler(folder, message) {
        return (req, res) => {
            if (!req.file) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'No file uploaded' 
                });
            }

            res.json({
                success: true,
                message,
                fileUrl: uploadService.buildFileUrl(folder, req.file.filename),
                filename: req.file.filename
            });
        };
    }

    /**
     * Upload issue image
     */
    uploadIssueImage = this.createUploadHandler('issue_img', 'Issue image uploaded successfully');

    /**
     * Upload profile image (backup route - main one is in auth)
     */
    uploadProfileImage = this.createUploadHandler('profiles', 'Profile picture uploaded successfully');

    /**
     * Upload proof image
     */
    uploadProofImage = this.createUploadHandler('proofs', 'Proof image uploaded successfully');

    /**
     * Validate folder and file existence - reduces code duplication
     * @param {string} folder - Folder name
     * @param {string} filename - File name
     * @param {Object} res - Response object
     * @returns {boolean} Whether validation passed
     */
    validateFileRequest(folder, filename, res) {
        // Validate folder using uploadService
        if (!uploadService.isValidFolder(folder)) {
            res.status(400).json({
                success: false,
                message: 'Invalid folder specified'
            });
            return false;
        }

        // Check if file exists using uploadService
        if (!uploadService.fileExists(folder, filename)) {
            res.status(404).json({
                success: false,
                message: 'Image not found'
            });
            return false;
        }

        return true;
    }

    /**
     * Serve/fetch image file with CORS support
     */
    getImage = (req, res) => {
        const { folder, filename } = req.params;
        
        if (!this.validateFileRequest(folder, filename, res)) {
            return;
        }

        try {
            const filePath = uploadService.getFilePath(folder, filename);
            const fileStats = uploadService.getFileStats(folder, filename);

            // Set CORS headers explicitly for cross-origin requests
            const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
            res.set({
                'Access-Control-Allow-Origin': clientUrl,
                'Access-Control-Allow-Credentials': 'true',
                'Cross-Origin-Resource-Policy': 'cross-origin',
                'Content-Type': uploadService.getContentType(path.extname(filename)),
                'Content-Length': fileStats.size,
                'Cache-Control': 'public, max-age=86400', // Cache for 1 day
                'ETag': `"${fileStats.mtime.getTime()}-${fileStats.size}"`
            });

            // Send file
            res.sendFile(filePath);
        } catch (error) {
            console.error('Error serving image:', error);
            res.status(500).json({
                success: false,
                message: 'Error serving image'
            });
        }
    };

    /**
     * Get image info/metadata
     */
    getImageInfo = (req, res) => {
        const { folder, filename } = req.params;
        
        if (!this.validateFileRequest(folder, filename, res)) {
            return;
        }

        try {
            const fileStats = uploadService.getFileStats(folder, filename);
            const fileUrl = uploadService.buildFileUrl(folder, filename);

            res.json({
                success: true,
                data: {
                    filename,
                    folder,
                    url: fileUrl,
                    size: fileStats.size,
                    created: fileStats.birthtime,
                    modified: fileStats.mtime,
                    extension: path.extname(filename).toLowerCase()
                }
            });
        } catch (error) {
            console.error('Error getting image info:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting image information'
            });
        }
    };

    /**
     * Delete image file
     */
    deleteImage = (req, res) => {
        const { folder, filename } = req.params;
        
        if (!this.validateFileRequest(folder, filename, res)) {
            return;
        }

        try {
            const deleted = uploadService.deleteFile(folder, filename);
            
            if (deleted) {
                res.json({
                    success: true,
                    message: 'Image deleted successfully'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to delete image'
                });
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting image'
            });
        }
    };

    /**
     * List images in a folder
     */
    listImages = (req, res) => {
        const { folder } = req.params;
        const { page = 1, limit = 20 } = req.query;
        
        // Validate folder using uploadService
        if (!uploadService.isValidFolder(folder)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid folder specified'
            });
        }

        try {
            const files = uploadService.listFiles(folder);
            const imageFiles = files.filter(file => {
                const ext = path.extname(file).toLowerCase();
                return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
            });

            // Pagination
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + parseInt(limit);
            const paginatedFiles = imageFiles.slice(startIndex, endIndex);

            // Build response with URLs
            const images = paginatedFiles.map(filename => ({
                filename,
                url: uploadService.buildFileUrl(folder, filename),
                stats: uploadService.getFileStats(folder, filename)
            }));

            res.json({
                success: true,
                data: {
                    images,
                    pagination: {
                        current_page: parseInt(page),
                        per_page: parseInt(limit),
                        total_files: imageFiles.length,
                        total_pages: Math.ceil(imageFiles.length / limit),
                        has_next: endIndex < imageFiles.length,
                        has_prev: startIndex > 0
                    }
                }
            });
        } catch (error) {
            console.error('Error listing images:', error);
            res.status(500).json({
                success: false,
                message: 'Error listing images'
            });
        }
    };

    /**
     * Handle upload errors - delegates to uploadService
     */
    handleUploadError = (error, req, res, next) => {
        return uploadService.handleUploadError(error, res);
    };
}

module.exports = new FileController();