const router = require("express").Router();
const ctrl = require("../controllers/admin_cms");
const auth = require("../middlewares/auth");

// Get all content (admin overview)
router.get("/", ctrl.getAllContent);

// Get all content for a specific page
router.get("/page/:page", ctrl.getPageContent);

// Get specific section content
router.get("/page/:page/section/:section", ctrl.getSectionContent);

// Create or update section content (upsert)
router.post("/page/:page/section/:section", ctrl.saveSectionContent);
router.put("/page/:page/section/:section", ctrl.saveSectionContent);

// Bulk update multiple sections for a page
router.post("/page/:page/bulk", ctrl.bulkUpdateSections);
router.put("/page/:page/bulk", ctrl.bulkUpdateSections);

// Delete section content
router.delete("/page/:page/section/:section", ctrl.deleteSectionContent);

module.exports = router;

