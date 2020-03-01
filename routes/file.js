const express = require('express');
const router = express.Router();
const clientScript = require('../public/js/client');

router.get('/', function (req, res) {
    const fileuploadStatus = req.app.locals.fileuploadStatus;
    const docuploadStatus = req.app.locals.docuploadStatus;
    const htmlVal = res.app.locals.htmlVal;
    const errorMsg = res.app.locals.errorMsg;
    req.app.locals.fileuploadStatus = false;
    req.app.locals.docuploadStatus = false;
    res.app.locals.htmlVal = '';
    clientScript.includeHtml(htmlVal);
    res.render('file', {
        title: 'File Upload Using Multer in Node.js and Express',
        utils: clientScript,
        fileuploadStatus: fileuploadStatus,
        docuploadStatus: docuploadStatus,
        errorMsg: errorMsg,
        htmlVal: htmlVal
    });
});

module.exports = router;