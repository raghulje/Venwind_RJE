const status = require("../helpers/response");
const {
  CapabilitiesHero,
  CapabilitiesResearch,
  CapabilitiesFacility,
} = require("../models");

module.exports = {
  // Helper to normalize incoming payloads for research section
  _normalizeResearch(req) {
    const parseMaybeJson = (val) => {
      if (val == null) return null;
      if (typeof val === "string") {
        try { return JSON.parse(val); } catch { return val; }
      }
      return val;
    };
    return {
      title: req.body.title || "",
      description: req.body.description || null,
      image: req.body.image || null,
      apiCard: parseMaybeJson(req.body.apiCard) || null,
      fdfCard: parseMaybeJson(req.body.fdfCard) || null,
      promise: parseMaybeJson(req.body.promise) || null,
      isActive: req.body.isActive !== undefined ? !!req.body.isActive : true,
    };
  },
  getAll: async (req, res) => {
    try {
      const [hero, research, facilities] = await Promise.all([
        CapabilitiesHero.findOne(),
        CapabilitiesResearch.findOne(),
        CapabilitiesFacility.findAll({ order: [["order", "ASC"]] }),
      ]);
      return status.responseStatus(res, 200, "Capabilities fetched", {
        hero,
        research,
        facilities,
      });
    } catch (e) {
      return status.responseStatus(res, 500, e.message);
    }
  },

  hero: {
    get: async (req, res) => {
      try {
        const row = await CapabilitiesHero.findOne();
        return status.responseStatus(res, 200, "OK", row);
      } catch (e) {
        return status.responseStatus(res, 500, e.message);
      }
    },
    upsert: async (req, res) => {
      try {
        const payload = {
          title: req.body.title || "",
          subtitle: req.body.subtitle || null,
          description: req.body.description || null,
          subDescription: req.body.subDescription || null,
          backgroundImage: req.body.backgroundImage || "",
          isActive: req.body.isActive !== undefined ? !!req.body.isActive : true,
        };
        const existing = await CapabilitiesHero.findOne();
        let saved;
        if (existing) {
          await existing.update(payload);
          saved = existing;
        } else {
          saved = await CapabilitiesHero.create(payload);
        }
        return status.responseStatus(res, 200, "Saved", saved);
      } catch (e) {
        return status.responseStatus(res, 500, e.message);
      }
    },
  },

  research: {
    get: async (req, res) => {
      try {
        const row = await CapabilitiesResearch.findOne();
        return status.responseStatus(res, 200, "OK", row);
      } catch (e) {
        return status.responseStatus(res, 500, e.message);
      }
    },
    create: async (req, res) => {
      try {
        const payload = module.exports._normalizeResearch(req);
        const created = await CapabilitiesResearch.create(payload);
        return status.responseStatus(res, 201, "Created", created);
      } catch (e) {
        return status.responseStatus(res, 500, e.message);
      }
    },
    update: async (req, res) => {
      try {
        const row = await CapabilitiesResearch.findOne();
        if (!row) return status.responseStatus(res, 404, "Not Found");
        const incoming = module.exports._normalizeResearch(req);
        await row.update({
          title: incoming.title ?? row.title,
          description: incoming.description ?? row.description,
          image: incoming.image ?? row.image,
          apiCard: incoming.apiCard ?? row.apiCard,
          fdfCard: incoming.fdfCard ?? row.fdfCard,
          promise: incoming.promise ?? row.promise,
          isActive: incoming.isActive ?? row.isActive,
        });
        return status.responseStatus(res, 200, "Updated", row);
      } catch (e) {
        return status.responseStatus(res, 500, e.message);
      }
    },
    upsert: async (req, res) => {
      try {
        const payload = module.exports._normalizeResearch(req);
        const existing = await CapabilitiesResearch.findOne();
        let saved;
        if (existing) {
          await existing.update(payload);
          saved = existing;
        } else {
          saved = await CapabilitiesResearch.create(payload);
        }
        return status.responseStatus(res, 200, "Saved", saved);
      } catch (e) {
        return status.responseStatus(res, 500, e.message);
      }
    },
  },

  facilities: {
    list: async (req, res) => {
      try {
        const rows = await CapabilitiesFacility.findAll({ order: [["order", "ASC"]] });
        return status.responseStatus(res, 200, "OK", rows);
      } catch (e) {
        return status.responseStatus(res, 500, e.message);
      }
    },
    create: async (req, res) => {
      try {
        const payload = {
          name: req.body.name || "",
          type: req.body.type || "",
          location: req.body.location || null,
          capacity: req.body.capacity || null,
          established: req.body.established || null,
          image: req.body.image || null,
          capabilities: req.body.capabilities || [],
          approvals: req.body.approvals || [],
          color: req.body.color || null,
          order: req.body.order || 0,
          isActive: req.body.isActive !== undefined ? !!req.body.isActive : true,
        };
        const created = await CapabilitiesFacility.create(payload);
        return status.responseStatus(res, 201, "Created", created);
      } catch (e) {
        return status.responseStatus(res, 500, e.message);
      }
    },
    update: async (req, res) => {
      try {
        const id = req.params.id;
        const row = await CapabilitiesFacility.findByPk(id);
        if (!row) return status.responseStatus(res, 404, "Not Found");
        await row.update({
          name: req.body.name ?? row.name,
          type: req.body.type ?? row.type,
          location: req.body.location ?? row.location,
          capacity: req.body.capacity ?? row.capacity,
          established: req.body.established ?? row.established,
          image: req.body.image ?? row.image,
          capabilities: req.body.capabilities ?? row.capabilities,
          approvals: req.body.approvals ?? row.approvals,
          color: req.body.color ?? row.color,
          order: req.body.order ?? row.order,
          isActive: req.body.isActive ?? row.isActive,
        });
        return status.responseStatus(res, 200, "Updated", row);
      } catch (e) {
        return status.responseStatus(res, 500, e.message);
      }
    },
    remove: async (req, res) => {
      try {
        const id = req.params.id;
        const row = await CapabilitiesFacility.findByPk(id);
        if (!row) return status.responseStatus(res, 404, "Not Found");
        await row.destroy();
        return status.responseStatus(res, 200, "Deleted");
      } catch (e) {
        return status.responseStatus(res, 500, e.message);
      }
    },
  },
};


