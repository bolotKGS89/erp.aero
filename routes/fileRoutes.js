const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const fs = require('fs').promises;
const db = require('../models');
const authenticateToken = require('../middleware/authmiddleware'); // Correct path to authMiddleware

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads')); // Directory where files will be saved
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Use the original file name
    }
});

const upload = multer({ storage });

router.post('/upload', authenticateToken, upload.single('file'),  async (req, res) => {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
  
    try {
      const fileInfo = {
        name: file.originalname,
        extension: path.extname(file.originalname),
        mimeType: file.mimetype,
        size: file.size,
        uploadDate: new Date()
      };

      // Save file information to the database
      const savedFile = await db.File.create(fileInfo);
      res.status(201).json({ message: 'File uploaded successfully', file: savedFile });
    } catch (error) {
      res.status(500).json({ message: 'Error saving file information', error: error.message });
    }
  });

// Pagination endpoint
router.get('/list', authenticateToken, async (req, res) => {
    const listSize = parseInt(req.query.list_size) || 10; // Default to 10 if not provided
    const page = parseInt(req.query.page) || 1; // Default to 1 if not provided
    const offset = (page - 1) * listSize;
  
    try {
      const files = await db.File.findAndCountAll({
        limit: listSize,
        offset: offset
      });
  
      res.status(200).json({
        totalFiles: files.count,
        totalPages: Math.ceil(files.count / listSize),
        currentPage: page,
        files: files.rows
      });
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving files', error: error.message });
    }
});

router.delete('/delete/:id', authenticateToken, async (req, res) => {
  const fileId = req.params.id;

  try {
    const file = await db.File.findByPk(fileId);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Delete the file from local storage
    try {
      // Delete the file from local storage
      await fs.unlink(path.join(__dirname, '../uploads', file.name));

      // Delete the file record from the database
      await file.destroy();

      res.status(200).json({ message: 'File deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting file from local storage', error: err.message });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting file', error: error.message });
  }
});

router.put('/update/:id', authenticateToken, upload.single('file'), async (req, res) => {
  const fileId = req.params.id;
  const newFile = req.file;

  if (!newFile) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    // Find the existing file record in the database
    const file = await db.File.findByPk(fileId);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Path to the old file
    const oldFilePath = path.join(__dirname, '../uploads', file.name);
  
    // Delete the old file from the local storage
    try {
      await fs.unlink(oldFilePath);
    } catch (err) {
      return res.status(500).json({ message: 'Error deleting old file', error: err.message });
    }

    // Update the file information in the database
    file.name = newFile.filename;
    file.extension = path.extname(newFile.originalname);
    file.mimeType = newFile.mimetype;
    file.size = newFile.size;
    file.uploadDate = new Date();

    console.log(file)

    await file.save();

    res.status(200).json({ message: 'File updated successfully', file });
  } catch (error) {
    res.status(500).json({ message: 'Error updating file', error: error.message });
  }
});


router.get('/:id', authenticateToken, async (req, res) => {
  const fileId = req.params.id;

  try {
    const file = await db.File.findByPk(fileId);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.status(200).json(file);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving file information', error: error.message });
  }
});

router.get('/download/:id', authenticateToken, async (req, res) => {
  const fileId = req.params.id;

  try {
    const file = await db.File.findByPk(fileId);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const pathFile = path.join( __dirname, '../uploads', file.name );
    // Check if the file exists
    await fs.access(pathFile);

    // Send the file for download
    res.download(pathFile);
  } catch (error) {
    res.status(500).json({ message: 'Error downloading file', error: error.message });
  }
});


module.exports = router;