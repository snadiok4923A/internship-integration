const express = require('express');
const { createApplication, getApplicationById } = require('../controllers/applicationController');
const { applicationRules, validateApplication } = require('../validators/applicationValidator');

const router = express.Router();

router.post('/', applicationRules, validateApplication, createApplication);
router.get('/:id', getApplicationById);

module.exports = router;
