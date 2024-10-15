const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = 3500;

// Middleware to parse JSON requests
app.use(bodyParser.json({ limit: '10mb' })); // Increase limit to 10MB

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/';
        // Check if the directory exists, if not create it
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath); // Directory where images will be stored
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filename
    }
});

const upload = multer({ storage });

// Connect to MongoDB Atlas (Updated connection without deprecated options)
const dbURI = 'mongodb+srv://giriprassath1s:xNc5vnzCPZMJZRP5@cluster0.gwvs2.mongodb.net/user_data?retryWrites=true&w=majority'; 
mongoose.connect(dbURI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log('MongoDB connection error:', err));

// Define a schema and model for user data
const userSchema = new mongoose.Schema({
    name: String,
    photoPath: String // Store the file path of the uploaded image
});
const User = mongoose.model('User', userSchema);

// Route to handle saving data with file upload
app.post('/save', upload.single('photo'), async (req, res) => {
    const { name } = req.body;
    const photoPath = req.file.path; // Get the uploaded file path

    // Save user data (name and photoPath) to MongoDB
    const newUser = new User({ name, photoPath });
    try {
        await newUser.save();
        res.json({ message: 'Data saved successfully', photoPath });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve the geolocation.html file (Make sure to provide the correct absolute path)
// Serve the geolocation.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'geolocation.html')); // Use correct relative path
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
