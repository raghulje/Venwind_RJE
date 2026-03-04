const { ResearchInnovation } = require("../models");
const status = require("../helpers/response");

module.exports = {
  getAll: async (req, res) => {
    try {
      const rows = await ResearchInnovation.findAll({ 
        where: { isActive: true },
        order: [["order", "ASC"]] 
      });
      return status.responseStatus(res, 200, "OK", rows);
    } catch (e) {
      return status.responseStatus(res, 500, e.message);
    }
  },

  list: async (req, res) => {
    try {
      const rows = await ResearchInnovation.findAll({ 
        order: [["order", "ASC"]] 
      });
      return status.responseStatus(res, 200, "OK", rows);
    } catch (e) {
      return status.responseStatus(res, 500, e.message);
    }
  },

  get: async (req, res) => {
    try {
      const { id } = req.params;
      const row = await ResearchInnovation.findByPk(id);
      if (!row) return status.responseStatus(res, 404, "Not found");
      return status.responseStatus(res, 200, "OK", row);
    } catch (e) {
      return status.responseStatus(res, 500, e.message);
    }
  },

  create: async (req, res) => {
    try {
      const payload = {
        cardTitle: req.body.cardTitle || '',
        cardSubtitle: req.body.cardSubtitle || '',
        cardDescription: req.body.cardDescription || '',
        order: req.body.order || 0,
        isActive: req.body.isActive ?? true
      };
      const created = await ResearchInnovation.create(payload);
      return status.responseStatus(res, 201, "Created", created);
    } catch (e) {
      return status.responseStatus(res, 500, e.message);
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const row = await ResearchInnovation.findByPk(id);
      if (!row) return status.responseStatus(res, 404, "Not found");
      
      await row.update({
        cardTitle: req.body.cardTitle ?? row.cardTitle,
        cardSubtitle: req.body.cardSubtitle ?? row.cardSubtitle,
        cardDescription: req.body.cardDescription ?? row.cardDescription,
        order: req.body.order ?? row.order,
        isActive: req.body.isActive ?? row.isActive
      });
      return status.responseStatus(res, 200, "Updated", row);
    } catch (e) {
      return status.responseStatus(res, 500, e.message);
    }
  },

  remove: async (req, res) => {
    try {
      const { id } = req.params;
      const row = await ResearchInnovation.findByPk(id);
      if (!row) return status.responseStatus(res, 404, "Not found");
      await row.destroy();
      return status.responseStatus(res, 200, "Deleted");
    } catch (e) {
      return status.responseStatus(res, 500, e.message);
    }
  }
};
