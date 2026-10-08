const { body, validationResult } = require('express-validator');

const allowedWorkTypes = ['Remote', 'Hybrid', 'On-site'];

const internshipRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isString()
    .withMessage('Title must be a string')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),

  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company is required')
    .isString()
    .withMessage('Company must be a string')
    .isLength({ min: 2, max: 100 })
    .withMessage('Company must be between 2 and 100 characters'),

  body('domain')
    .trim()
    .notEmpty()
    .withMessage('Domain is required')
    .isString()
    .withMessage('Domain must be a string'),

  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isString()
    .withMessage('Location must be a string'),

  body('work_type')
    .trim()
    .notEmpty()
    .withMessage('Work type is required')
    .isIn(allowedWorkTypes)
    .withMessage('Work type must be one of: Remote, Hybrid, On-site'),

  body('duration')
    .trim()
    .notEmpty()
    .withMessage('Duration is required')
    .isString()
    .withMessage('Duration must be a string'),

  body('stipend')
    .notEmpty()
    .withMessage('Stipend is required')
    .isFloat({ min: 0 })
    .withMessage('Stipend must be a number greater than or equal to 0'),

  body('skills')
    .exists()
    .withMessage('Skills are required')
    .isArray({ min: 1 })
    .withMessage('Skills must be an array with at least one item')
    .custom((value) => value.every((skill) => typeof skill === 'string' && skill.trim().length > 0))
    .withMessage('Each skill must be a non-empty string'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters'),

  body('eligibility')
    .trim()
    .notEmpty()
    .withMessage('Eligibility is required'),

  body('deadline')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Deadline must be a valid date')
];

function validateInternship(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.path || 'unknown',
      message: error.msg
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: formattedErrors
      }
    });
  }

  return next();
}

module.exports = {
  internshipRules,
  validateInternship
};
