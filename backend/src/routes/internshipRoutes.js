const express = require('express');
const {
  getAllInternships,
  getInternshipById,
  createInternship,
  updateInternship,
  deleteInternship
} = require('../controllers/internshipController');
const { internshipRules, validateInternship } = require('../validators/internshipValidator');

const router = express.Router();

router.get('/', getAllInternships);
router.get('/:id', getInternshipById);
router.post('/', internshipRules, validateInternship, createInternship);
router.put('/:id', internshipRules, validateInternship, updateInternship);
router.delete('/:id', deleteInternship);

module.exports = router;
