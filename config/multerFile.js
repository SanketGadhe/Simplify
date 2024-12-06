const multer = require('multer');
const crypto = require('crypto');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../public/images'));
    },
    filename: function(req, file, cb) {
        crypto.randomBytes(16, (err, buf) => {
            if (err) {
                return cb(err);
            }
            const uniqueName = buf.toString('hex') + path.extname(file.originalname);
            cb(null, uniqueName);
        });
    }
});

// Initialize upload
const upload = multer({ storage: storage });

module.exports = upload;