var handlers = require('./handlers')
var express = require('express')
var router = express.Router()

router.route('/cm/files/upload-params').get(handlers.getUploadParams);

router.route('/cm/files').post(handlers.addFile);

module.exports = router;
