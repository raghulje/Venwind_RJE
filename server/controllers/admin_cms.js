const { CmsContent } = require("../models");
const status = require("../helpers/response");

function asyncHandler(fn) {
  return (req, res) => fn(req, res).catch((e) => status.responseStatus(res, 500, "Internal error", { error: e.message }));
}

// Get all CMS content for a specific page
exports.getPageContent = asyncHandler(async (req, res) => {
  const { page } = req.params;
  const contents = await CmsContent.findAll({
    where: { page },
    order: [["section", "ASC"]],
  });
  
  // Transform to object format: { section: data }
  const result = {};
  contents.forEach((content) => {
    result[content.section] = content.data;
  });
  
  return status.responseStatus(res, 200, "OK", result);
});

// Get specific section content
exports.getSectionContent = asyncHandler(async (req, res) => {
  const { page, section } = req.params;
  const content = await CmsContent.findOne({
    where: { page, section },
  });
  
  if (!content) {
    return status.responseStatus(res, 404, "Content not found");
  }
  
  // Return data with updatedAt for cache comparison
  return res.status(200).json({
    success: true,
    data: content.data,
    updatedAt: content.updatedAt.toISOString(),
  });
});

// Create or update section content (upsert)
exports.saveSectionContent = asyncHandler(async (req, res) => {
  const { page, section } = req.params;
  let data = req.body || {};
  
  // Handle URL-encoded form data (from form submissions)
  // If data is a flat object (form data), keep it as is
  // If it's already an object, use it directly
  if (typeof data === 'object' && !Array.isArray(data)) {
    // Remove page and section from data if present (they're in params)
    delete data.page;
    delete data.section;
  } else if (data === null || data === undefined) {
    // If data is null/undefined, use empty object
    data = {};
  } else {
    // If data is not an object, wrap it
    data = { value: data };
  }
  
  // Ensure data is always an object
  if (typeof data !== 'object' || Array.isArray(data)) {
    data = { value: data };
  }
  
  const [content, created] = await CmsContent.upsert(
    {
      page,
      section,
      data,
    },
    {
      returning: true,
    }
  );
  
  // Return data with updatedAt for cache management
  return res.status(created ? 201 : 200).json({
    success: true,
    data: content.data,
    updatedAt: content.updatedAt ? content.updatedAt.toISOString() : new Date().toISOString(),
    message: created ? "Created" : "Updated",
  });
});

// Bulk update multiple sections
exports.bulkUpdateSections = asyncHandler(async (req, res) => {
  const { page } = req.params;
  const sections = req.body; // Expected: { section1: { data }, section2: { data }, ... }
  
  if (!sections || typeof sections !== 'object') {
    return status.responseStatus(res, 400, "Invalid request body. Expected object with section keys.");
  }
  
  const results = [];
  for (const [section, data] of Object.entries(sections)) {
    const [content, created] = await CmsContent.upsert(
      {
        page,
        section,
        data: data || {},
      },
      {
        returning: true,
      }
    );
    results.push({
      section,
      created,
      data: content.data,
    });
  }
  
  return status.responseStatus(res, 200, "Bulk update completed", results);
});

// Delete section content
exports.deleteSectionContent = asyncHandler(async (req, res) => {
  const { page, section } = req.params;
  const content = await CmsContent.findOne({
    where: { page, section },
  });
  
  if (!content) {
    return status.responseStatus(res, 404, "Content not found");
  }
  
  await content.destroy();
  return status.responseStatus(res, 200, "Deleted");
});

// Get all CMS content (admin overview)
exports.getAllContent = asyncHandler(async (req, res) => {
  const contents = await CmsContent.findAll({
    order: [
      ["page", "ASC"],
      ["section", "ASC"],
    ],
  });
  
  // Group by page
  const result = {};
  contents.forEach((content) => {
    if (!result[content.page]) {
      result[content.page] = {};
    }
    result[content.page][content.section] = content.data;
  });
  
  return status.responseStatus(res, 200, "OK", result);
});

