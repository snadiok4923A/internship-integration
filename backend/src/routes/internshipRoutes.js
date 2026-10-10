const express = require('express');
const {
  getAllInternships,
  getInternshipById,
  createInternship,
  updateInternship,
  deleteInternship
} = require('../controllers/internshipController');
const { internshipRules, validateInternship } = require('../validators/internshipValidator');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(getAllInternships));
router.get('/:id', asyncHandler(getInternshipById));
router.post('/', internshipRules, validateInternship, asyncHandler(createInternship));
router.put('/:id', internshipRules, validateInternship, asyncHandler(updateInternship));
router.delete('/:id', asyncHandler(deleteInternship));

module.exports = router;
