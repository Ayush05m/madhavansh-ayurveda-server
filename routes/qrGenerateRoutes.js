const express = require('express');
const router = express.Router();
const { QrGerator } = require("../helpers/payementQRgenerator");

// Admin registration route
router.get('/:note', QrGerator);
module.exports = router;