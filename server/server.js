const express = require('express');
const PORT = 3000;
const app = express();

const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { kStringMaxLength } = require('buffer');
const { PDFDocument } = require('pdf-lib');
const axios = require('axios');
require('dotenv').config();

const SECRET = process.env.SECRET;
const upload = multer({ dest: 'upload/ '})

app.use(express.json());
app.use(cors());

const CONNECTION_STRING = process.env.CONNECTION_STRING;
mongoose.connect(CONNECTION_STRING)
.then(() => console.log('Connected to MongoDB.'))
.catch((err) => console.error('Connection failed: ', err));

const KEY = process.env.KEY;
const SECRET_KEY = process.env.SECRET_KEY;
const s3 = new S3Client({
  region: 'us-east-2',
  credentials: {
    accessKeyId: KEY,
    secretAccessKey: SECRET_KEY
  }
});

const BUCKET_NAME = process.env.BUCKET_NAME;

const fileSchema = new mongoose.Schema({
    filename: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now },
    type: String,
    size: Number
});

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    files: { type: [fileSchema], required: false}
});

const User = mongoose.model('User', userSchema);

app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if(user) {
        res.json({ message: "Username taken." });
    }
    else {
        const hash = await bcrypt.hash(password, 10);
        await User.create({ username, password: hash });
        res.json({ message: "Registration successful. Please login."})
    }
});

app.post("/login", async(req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if(user) {
        const valid = bcrypt.compareSync(password, user.password);
        if(!valid) {
            res.json({ message: "Incorrect password." });
        }
        else {
            const token = jwt.sign({ username }, SECRET, {expiresIn: "1h" } );
            res.json({ token });
        }
    }
    else {
        res.json({ message: "User does not exist."})
    }
});


app.get("/dashboard", (req, res) => {
    const authHeaders = req.headers.authorization;
    if(!authHeaders) {
        res.sendStatus(401);
    }
    else {
        const token = authHeaders.split(" ")[1];
        try {
            const payload = jwt.verify(token, SECRET);
            res.json({ payload });
        }
        catch {
            res.sendStatus(403);
        }
    }
});


app.post("/upload", upload.single('file'), async (req, res) => {
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const fileContent = fs.readFileSync(filePath);

    const params = {
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: fileContent
    }
    try {
    const command = new PutObjectCommand(params);
    await s3.send(command);
    fs.unlinkSync(req.file.path);

    const authHeaders = req.headers.authorization;
    const token = authHeaders.split(" ")[1];
    const payload = jwt.verify(token, SECRET);

    const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${req.file.originalname}`;

const user = await User.findOne({ username: payload.username });
if (!user) return res.status(404).send({ error: "User not found" });

user.files.push({
  filename: fileName,
  url: url,
  type: req.file.mimetype,
  size: req.file.size,
});

await user.save();


    res.send({ url });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Upload failed' });
  }
})

app.get("/files", async (req, res) => {
    const authHeaders = req.headers.authorization;
    const token = authHeaders.split(" ")[1];
    const payload = jwt.verify(token, SECRET);
    const user = await User.findOne({ username: payload.username});
    res.json({files: user.files});
});

app.post("/merge", async (req, res) => {
    try {
        const { files } = req.body;
        if(!files || files.length < 2) {
            return res.status(400).send({ error: "At least two PDFs are required."});
        }
        const mergedPdf = await PDFDocument.create();
        for (const url of files) {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const pdf = await PDFDocument.load(response.data);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
        }
        const mergedBytes = await mergedPdf.save();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=merged.pdf');
        res.send(Buffer.from(mergedBytes));
    }
    catch(err) {
        console.error(err);
        res.status(500).send({ error: "Merge failed"});
    }
})

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});