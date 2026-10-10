const express = require('express');
const { createApplication } = require('../controllers/applicationController');
const { applicationRules, validateApplication } = require('../validators/applicationValidator');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.post('/', applicationRules, validateApplication, asyncHandler(createApplication));

module.exports = router;
