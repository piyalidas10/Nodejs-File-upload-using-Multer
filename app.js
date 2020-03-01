const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const port = process.env.PORT || '3000';

const fileRouter = require('./routes/file');
const mammoth = require("mammoth");

// For STORAGE
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'uploads')
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + '-' + file.originalname)
    }
});
const fileupload = multer({
    dest: 'uploads/',
    storage: storage,
    limits: {
        fileSize: 30000000
    }
});
const docupload = multer({
    dest: 'uploads/',
    storage: storage,
    fileFilter: (req, file, callback) => {
        var ext = path.extname(file.originalname);
        if(ext !== '.doc' && ext !== '.docx') {
            // return callback(new Error('Only doc/docx are allowed'));
            callback(null, false);
        } else {
            callback(null, true);
        }
    },
    limits: {
        fileSize: 30000000
    }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
})); // parse application/x-www-form-urlencoded


// secure apps by setting various HTTP headers
app.use(helmet());
// enable CORS - Cross Origin Resource Sharing
app.use(cors());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.header("Access-Control-Allow-Methods", "PUT, POST, GET, OPTIONS, DELETE");
    next();
});

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));
app.post('/fileupload', fileupload.single('myfile'), (req, res, next) => {
    console.log('req.file', req.file);
    const file = req.file;
    if (!file) {
        return res.end('Please choose file to upload');
    }
    req.app.locals.fileuploadStatus = true;
    console.log('file path', req.file.path);
    res.redirect('/');
});

app.post('/convert', docupload.single('myfile'), (req, res, next) => {
    console.log('req.file', req.file);
    const file = req.file;
    if (!file) {
        req.app.locals.errorMsg = 'Only doc/docx are allowed';
    } else {
        mammoth.convertToHtml({
                path: file.path
            })
            .then(function (result) {
                const htmlVal = result.value; // The generated HTML
                const messages = result.messages; // Any messages, such as warnings during conversion
                res.app.locals.htmlVal = htmlVal;
                console.log('htmlVal => ', res.app.locals.htmlVal);
            })
            .done();
        req.app.locals.docuploadStatus = true;
    }
    res.redirect('/');
});

app.use(fileRouter);

/* for run nodejs with express js */
app.listen(port);