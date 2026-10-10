const { db, parseRow } = require('../config/database');

function normalizePaginationQuery(req, fallbackLimit = 10) {
  const pageInput = req.query.page;
  const limitInput = req.query.limit ?? fallbackLimit;

  if (pageInput !== undefined && (!Number.isInteger(Number(pageInput)) || Number(pageInput) < 1)) {
    const error = new Error('Page must be a positive integer');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  if (limitInput !== undefined && (!Number.isInteger(Number(limitInput)) || Number(limitInput) < 1 || Number(limitInput) > 50)) {
    const error = new Error('Limit must be an integer between 1 and 50');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const page = pageInput === undefined ? 1 : Number(pageInput);
  const limit = limitInput === undefined ? fallbackLimit : Number(limitInput);

  return {
    page: Math.min(page, Number.MAX_SAFE_INTEGER),
    limit: Math.min(limit, 50)
  };
}

async function getAllInternships(req, res, next) {
  try {
    const { page, limit } = normalizePaginationQuery(req);
    const filters = [];
    const params = [];

    if (req.query.domain) {
      filters.push('domain = ?');
      params.push(String(req.query.domain).trim());
    }

    if (req.query.location) {
      filters.push('location = ?');
      params.push(String(req.query.location).trim());
    }

    if (req.query.work_type) {
      filters.push('work_type = ?');
      params.push(String(req.query.work_type).trim());
    }

    let totalQuery = 'SELECT COUNT(*) AS total FROM internships';
    if (filters.length > 0) {
      totalQuery += ` WHERE ${filters.join(' AND ')}`;
    }

    const totalResult = await db.get(totalQuery, params);
    const total = Number(totalResult.total || 0);
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM internships';
    if (filters.length > 0) {
      query += ` WHERE ${filters.join(' AND ')}`;
    }
    query += ' ORDER BY id ASC LIMIT ? OFFSET ?';

    const internships = (await db.all(query, [...params, limit, offset])).map(parseRow);

    return res.status(200).json({
      success: true,
      data: internships,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    if (error && error.statusCode) {
      return next(error);
    }

    return next({
      statusCode: 500,
      code: 'DATABASE_ERROR',
      message: 'Failed to fetch internships'
    });
  }
}

async function getInternshipById(req, res, next) {
  const internshipId = Number(req.params.id);

  if (!Number.isInteger(internshipId) || internshipId <= 0) {
    return next({
      statusCode: 400,
      code: 'INVALID_ID',
      message: 'Internship ID must be a positive integer'
    });
  }

  try {
    const internship = parseRow(await db.get('SELECT * FROM internships WHERE id = ?', [internshipId]));

    if (!internship) {
      return next({
        statusCode: 404,
        code: 'INTERNSHIP_NOT_FOUND',
        message: 'Internship not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: internship
    });
  } catch (error) {
    return next({
      statusCode: 500,
      code: 'DATABASE_ERROR',
      message: 'Failed to fetch internship'
    });
  }
}

async function createInternship(req, res, next) {
  const { title, company, domain, location, work_type, duration, stipend, skills, description, eligibility, deadline } = req.body;
  const cleanedSkills = Array.isArray(skills)
    ? skills.map((skill) => String(skill).trim()).filter(Boolean)
    : [];

  try {
    const result = await db.get(`
      INSERT INTO internships (
        title,
        company,
        domain,
        location,
        work_type,
        duration,
        stipend,
        skills,
        description,
        eligibility,
        deadline,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id
    `, [
      String(title).trim(),
      String(company).trim(),
      String(domain).trim(),
      String(location).trim(),
      String(work_type).trim(),
      String(duration).trim(),
      Number(stipend),
      JSON.stringify(cleanedSkills),
      String(description).trim(),
      String(eligibility).trim(),
      deadline || null
    ]);

    const savedInternship = parseRow(await db.get('SELECT * FROM internships WHERE id = ?', [result.id]));

    return res.status(201).json({
      success: true,
      data: savedInternship
    });
  } catch (error) {
    return next({
      statusCode: 500,
      code: 'DATABASE_ERROR',
      message: 'Failed to create internship'
    });
  }
}

async function updateInternship(req, res, next) {
  const internshipId = Number(req.params.id);

  if (!Number.isInteger(internshipId) || internshipId <= 0) {
    return next({
      statusCode: 400,
      code: 'INVALID_ID',
      message: 'Internship ID must be a positive integer'
    });
  }

  const { title, company, domain, location, work_type, duration, stipend, skills, description, eligibility, deadline } = req.body;
  const cleanedSkills = Array.isArray(skills)
    ? skills.map((skill) => String(skill).trim()).filter(Boolean)
    : [];

  try {
    const existingInternship = await db.get('SELECT * FROM internships WHERE id = ?', [internshipId]);
    if (!existingInternship) {
      return next({
        statusCode: 404,
        code: 'INTERNSHIP_NOT_FOUND',
        message: 'Internship not found'
      });
    }

    await db.run(`
      UPDATE internships
      SET title = ?,
          company = ?,
          domain = ?,
          location = ?,
          work_type = ?,
          duration = ?,
          stipend = ?,
          skills = ?,
          description = ?,
          eligibility = ?,
          deadline = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      String(title).trim(),
      String(company).trim(),
      String(domain).trim(),
      String(location).trim(),
      String(work_type).trim(),
      String(duration).trim(),
      Number(stipend),
      JSON.stringify(cleanedSkills),
      String(description).trim(),
      String(eligibility).trim(),
      deadline || null,
      internshipId
    ]);

    const updatedInternship = parseRow(await db.get('SELECT * FROM internships WHERE id = ?', [internshipId]));

    return res.status(200).json({
      success: true,
      data: updatedInternship
    });
  } catch (error) {
    return next({
      statusCode: 500,
      code: 'DATABASE_ERROR',
      message: 'Failed to update internship'
    });
  }
}

async function deleteInternship(req, res, next) {
  const internshipId = Number(req.params.id);

  if (!Number.isInteger(internshipId) || internshipId <= 0) {
    return next({
      statusCode: 400,
      code: 'INVALID_ID',
      message: 'Internship ID must be a positive integer'
    });
  }

  try {
    const result = await db.run('DELETE FROM internships WHERE id = ?', [internshipId]);

    if (result.changes === 0) {
      return next({
        statusCode: 404,
        code: 'INTERNSHIP_NOT_FOUND',
        message: 'Internship not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Internship deleted successfully'
    });
  } catch (error) {
    return next({
      statusCode: 500,
      code: 'DATABASE_ERROR',
      message: 'Failed to delete internship'
    });
  }
}

module.exports = {
  getAllInternships,
  getInternshipById,
  createInternship,
  updateInternship,
  deleteInternship
};
