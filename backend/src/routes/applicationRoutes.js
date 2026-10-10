const express = require('express');
const { createApplication, getApplicationById } = require('../controllers/applicationController');
const { applicationRules, validateApplication } = require('../validators/applicationValidator');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.post('/', applicationRules, validateApplication, asyncHandler(createApplication));
router.get('/:id', asyncHandler(getApplicationById));

module.exports = router;
