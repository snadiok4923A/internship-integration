const { db, parseRow } = require('../config/database');

async function createApplication(req, res, next) {
  const { internship_id, full_name, email, phone, education, college, resume_url, cover_message } = req.body;

  try {
    const internshipExists = await db.get('SELECT id FROM internships WHERE id = ?', [Number(internship_id)]);

    if (!internshipExists) {
      return next({
        statusCode: 404,
        code: 'INTERNSHIP_NOT_FOUND',
        message: 'Selected internship does not exist'
      });
    }

    const result = await db.get(`
      INSERT INTO applications (
        internship_id,
        full_name,
        email,
        phone,
        education,
        college,
        resume_url,
        cover_message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING id
    `, [
      Number(internship_id),
      String(full_name).trim(),
      String(email).trim(),
      String(phone).trim(),
      String(education).trim(),
      String(college).trim(),
      String(resume_url).trim(),
      String(cover_message).trim()
    ]);

    return res.status(201).json({
      success: true,
      data: {
        id: result.id,
        message: 'Application submitted successfully'
      }
    });
  } catch (error) {
    return next({
      statusCode: 500,
      code: 'DATABASE_ERROR',
      message: 'Failed to submit application'
    });
  }
}

async function getApplicationById(req, res, next) {
  const applicationId = Number(req.params.id);

  if (!Number.isInteger(applicationId) || applicationId <= 0) {
    return next({
      statusCode: 400,
      code: 'INVALID_ID',
      message: 'Application ID must be a positive integer'
    });
  }

  try {
    const application = await db.get('SELECT * FROM applications WHERE id = ?', [applicationId]);

    if (!application) {
      return next({
        statusCode: 404,
        code: 'APPLICATION_NOT_FOUND',
        message: 'Application not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    return next({
      statusCode: 500,
      code: 'DATABASE_ERROR',
      message: 'Failed to fetch application'
    });
  }
}

module.exports = {
  createApplication,
  getApplicationById
};
