require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require("bcrypt");
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
    className: { type: String, required: true },
    medium: {type: String, required: true},
    version: { type: String, required: true },
    bookName: { type: String, required: true },
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

const yearSchema = new mongoose.Schema({
    year: { type: String, required: true, unique: true },
});

const Year = mongoose.model('Year', yearSchema);

const classSchema = new mongoose.Schema({
    className: { type: String, required: true, unique: true },
});

const ClassName = mongoose.model('ClassName', classSchema);

const mediumSchema = new mongoose.Schema({
    medium: { type: String, required: true, unique: true },
});

const Medium = mongoose.model('Medium', mediumSchema);

const versionSchema = new mongoose.Schema({
    version: { type: String, required: true, unique: true },
});

const Version = mongoose.model('Version', versionSchema);


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

 app.get('/users', async function (req, res) {
  const managers = await User.find()
  res.status(200).json([...managers])
})

app.get('/books', async function (req, res) {
    const books = await Document.find()
    res.status(200).json([...books])
  })

  app.get('/year', async function (req, res) {
    const years = await Year.find()
    res.status(200).json([...years])
  })

  app.get('/class', async function (req, res) {
    const classes = await ClassName.find()
    res.status(200).json([...classes])
  })

  app.get('/medium', async function (req, res) {
    const mediums = await Medium.find()
    res.status(200).json([...mediums])
  })

  app.get('/version', async function (req, res) {
    const version = await Version.find()
    res.status(200).json([...version])
  })

app.post('/user/create', async (req, res) => {
    const { email, pass } = req.body;
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already created using this email" });
    }
    const hashedPassword = await bcrypt.hash(pass, 10);
    const manager = new User({ email, password: hashedPassword });
    await manager.save();
    res.status(201).json({ success: true, message: "User created successfully" });
  });


  app.post('/addyear', async (req, res) => {
    const { year } = req.body;
    const existingYear = await Year.findOne({ year })
    if (existingYear) {
      return res.status(400).json({ success: false, message: "year already created" });
    }
    const addedyear = new Year({ year });
    await addedyear.save();
    res.status(201).json({ success: true, message: "year added successfully" });
  });


  app.post('/addclass', async (req, res) => {
    const { className } = req.body;
    const existingClass = await ClassName.findOne({ className })
    if (existingClass) {
      return res.status(400).json({ success: false, message: "class already created" });
    }
    const addedClass = new ClassName({ className });
    await addedClass.save();
    res.status(201).json({ success: true, message: "class added successfully" });
  });


  app.post('/addmedium', async (req, res) => {
    const { medium } = req.body;
    const existingMedium = await Medium.findOne({ medium })
    if (existingMedium) {
      return res.status(400).json({ success: false, message: "Medium already created" });
    }
    const addedMedium = new Medium({ medium });
    await addedMedium.save();
    res.status(201).json({ success: true, message: "Medium added successfully" });
  });
  

  app.post('/addversion', async (req, res) => {
    const { version } = req.body;
    const existingVersion = await Version.findOne({ version })
    if (existingVersion) {
      return res.status(400).json({ success: false, message: "Version already created" });
    }
    const addedVersion = new Version({ version });
    await addedVersion.save();
    res.status(201).json({ success: true, message: "Version added successfully" });
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
        const { className, subject, medium, version, drivePdfUrl } = req.body;
        const newDocument = new Document({ className, medium, subject, version, drivePdfUrl });
        await newDocument.save();
        res.status(201).json({ success: true, message: 'Document added', data: newDocument });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error saving document', error });
    }
});

app.post('/create-book', async (req, res) => {
    try {
        const { className, bookName, medium, version } = req.body;
        const newDocument = new Document({ className, medium, bookName, version });
        await newDocument.save();
        res.status(201).json({ success: true, message: 'Document added', data: newDocument });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error saving document', error });
    }
});

app.get('/book', async (req, res) => {
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
