const s3 = require('./s3')
const File = require('../common/models/file')
const { notFoundExc } = require('../common/helpers')

const { validateFileData, validationExc } = require('./helpers')

// get upload params to support uploading file on front end
async function getUploadParams(req, res, next) {
  return res.json(s3.getUploadParams())
}

// add a file metadata to database
async function addFile(req, res, next) {
  try {
    var data = req.body
    var errors = validateFileData(data)
    if (errors) {
      return next(validationExc('Invalid file data', errors))
    }

    var file = new File({
      url: data.url,
      filename: data.filename,
      type: data.type,
      meta: {
        ['s3-bucket']: data.bucket,
        ['s3-region']: data.region,
        ['s3-key']: data.key
      }
    })
    await file.save()
    return res.json(file)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getUploadParams,
  addFile,
}
