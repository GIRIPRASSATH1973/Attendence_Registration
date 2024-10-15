const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');

const app = express();
const port = 3500;

// Middleware to parse JSON requests
app.use(bodyParser.json({ limit: '10mb' })); // Increase limit to 10MB

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory where images will be stored
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filename
    }
});

const upload = multer({ storage });

// Connect to MongoDB Atlas
const dbURI = 'mongodb+srv://giriprassath1s:xNc5vnzCPZMJZRP5@cluster0.gwvs2.mongodb.net/user_data?retryWrites=true&w=majority'; // Replace with your actual password
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(err));

// Define a schema and model
const userSchema = new mongoose.Schema({
    name: String,
    photoPath: String // Store the file path
});
const User = mongoose.model('User', userSchema);

// Route to handle saving data with file upload
app.post('/save', upload.single('photo'), async (req, res) => {
    const { name } = req.body;
    const photoPath = req.file.path; // Get the uploaded file path

    // Save to MongoDB
    const newUser = new User({ name, photoPath });
    try {
        await newUser.save();
        res.json({ message: 'Data saved successfully', photoPath });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save data' });
    }
});

// Serve static files from the uploads directory
app.use('/uploads', express.static('uploads'));

// Serve the geolocation.html from your specific path
app.get('/', (req, res) => {
    res.sendFile('/Users/giriprassath/Desktop/Giri/Attendence/gelocation.html'); // Use absolute path to serve the file
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});