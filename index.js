require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require("cors");

// Initialize Express
const app = express();
app.use(bodyParser.json());

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
  }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

// Define Schema

const documentSchema = new mongoose.Schema({
    year: {type: String, require: true},
    grade: { type: String, required: true },
    medium: {type: String, required: true},
    version: { type: String, required: true },
    subject: { type: String, required: true },
    drivePdfUrl: { type: String, required: false }
});

// Create Model
const Document = mongoose.model('Document', documentSchema);

const adminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
})

const Admin = mongoose.model('Admin', adminSchema)

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}, {timestamps: true});

const User = mongoose.model('User', userSchema)

// Predefined login credentials
const EMAIL = 'uploader@nctb.com';
const PASSWORD = '123456';

const ADMIN_EMAIL = 'admin@nctb.com'
const ADMIN_PASSWORD = '123456'

// Login Route
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (email === EMAIL && password === PASSWORD) {
        res.json({ success: true, message: 'Login successful' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// admin login route
app.post('/admin/login', async function (req, res) {
    const { email, password, remember } = req.body;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        res.json({ success: true, message: 'Login successful', });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // const admin = await Admin.findOne({ email });
    // if (!admin) return res.status(401).json({ message: "User does not exist in records!" });
    // const validPassword = await bcrypt.compare(password, admin.password);
    // if (validPassword == false) return res.status(401).json({ message: "Invalid email or password" });
    // if (remember == true) {
    //   const token = jwt.sign({ admin }, process.env.JWT_SECRET);
    //   return res.cookie('token', token, { maxAge: 86400000 }).status(200).json({ success: true, message: "Logged in successfully", admin });
    // }
  
    // return res.json({ success: true, message: "Logged in successfully", admin });
  })

 app.get('/managers', async function (req, res) {
  const managers = await user.find()
  res.status(200).json([...managers])
})


app.post('/user/create', async (req, res) => {
    const { email, pass } = req.body;
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already created using this email" });
    }
    const hashedPassword = await bcrypt.hash(pass, 10);
    const manager = new user({ email, password: hashedPassword, branch });
    await manager.save();
    res.status(201).json({ success: true, message: "User created successfully" });
  });
  
  
  // delete branch manager
  
  app.post('/user/delete', async (req, res) => {
    const { email } = req.body;
    const manager = await User.findOneAndDelete({ email });
    if (!manager) return res.status(404).json({ message: 'User not found', success: false });
    return res.json({ success: true, message: 'User deleted successfully' });
  })

// POST route to add a new document
app.post('/documents', async (req, res) => {
    try {
        const { grade, subject, medium, version, drivePdfUrl } = req.body;
        const newDocument = new Document({ grade, medium, subject, version, drivePdfUrl });
        await newDocument.save();
        res.status(201).json({ success: true, message: 'Document added', data: newDocument });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error saving document', error });
    }
});

app.get('/documents', async (req, res) => {
    try {
        const { grade, medium, subject, version, drivePdfUrl } = req.query;

        // Ensure all required query parameters are present
        if (!grade || !medium || !subject || !version || !drivePdfUrl) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required query parameters: grade, medium, subject, version, and drivePdfUrl' 
            });
        }

        // Query to match all parameters
        const query = { grade, medium, subject, version, drivePdfUrl };

        const documents = await Document.find(query);

        res.json({ success: true, data: documents });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching documents', error });
    }
});


// Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
