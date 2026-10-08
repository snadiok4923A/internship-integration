const { body, validationResult } = require('express-validator');

const applicationRules = [
  body('internship_id')
    .exists({ checkFalsy: true })
    .withMessage('Internship is required')
    .isInt({ min: 1 })
    .withMessage('Internship ID must be a positive integer'),

  body('full_name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address'),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9+()\-\s]{7,20}$/)
    .withMessage('Please enter a valid phone number'),

  body('education')
    .trim()
    .notEmpty()
    .withMessage('Education is required'),

  body('college')
    .trim()
    .notEmpty()
    .withMessage('College is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('College name must be between 2 and 150 characters'),

  body('resume_url')
    .trim()
    .notEmpty()
    .withMessage('Resume URL is required')
    .isURL({ require_protocol: true })
    .withMessage('Resume URL must be a valid URL'),

  body('cover_message')
    .trim()
    .notEmpty()
    .withMessage('Cover message is required')
    .isLength({ min: 20, max: 1000 })
    .withMessage('Cover message must contain between 20 and 1000 characters')
];

function validateApplication(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid application data',
        details: errors.array().map((error) => ({
          field: error.path || 'unknown',
          message: error.msg
        }))
      }
    });
  }

  return next();
}

module.exports = {
  applicationRules,
  validateApplication
};
