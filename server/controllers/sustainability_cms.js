const status = require("../helpers/response");
const {
  SustainabilityHero,
  SdgCard,
  Policy,
  VisionMission,
  SocialSection,
  FooterSection,
  InnovationTransformation,
  DigitalSolution,
  ResearchInnovation,
  SustainabilityHeart,
} = require("../models");

module.exports = {
  getAll: async (req, res) => {
    try {
      const [hero, sdgCards, policies, visionMission, social, footer, innovationTransformation, digitalSolutions, researchInnovations, heart] = await Promise.all([
        SustainabilityHero.findOne(),
        SdgCard.findAll({ order: [["order", "ASC"]] }),
        Policy.findAll({ order: [["order", "ASC"]] }),
        VisionMission.findOne(),
        SocialSection.findOne(),
        FooterSection.findOne(),
        InnovationTransformation.findOne(),
        DigitalSolution.findAll({ order: [["order", "ASC"]] }),
        ResearchInnovation.findAll({ order: [["order", "ASC"]] }),
        SustainabilityHeart.findOne(),
      ]);
      return status.responseStatus(res, 200, "Sustainability fetched", {
        hero,
        sdgCards,
        policies,
        visionMission,
        social,
        footer,
        innovationTransformation,
        digitalSolutions,
        researchInnovations,
        heart,
      });
    } catch (e) {
      return status.responseStatus(res, 500, e.message);
    }
  },

  hero: {
    get: async (req, res) => {
      try {
        const row = await SustainabilityHero.findOne();
        return status.responseStatus(res, 200, "OK", row);
      } catch (e) {
        return status.responseStatus(res, 500, e.message);
      }
    },
    upsert: async (req, res) => {
      try {
        const payload = {
          title: req.body.title || "",
          description: req.body.description || null,
          backgroundImage: req.body.backgroundImage || null,
          isActive: req.body.isActive !== undefined ? !!req.body.isActive : true,
        };
        const existing = await SustainabilityHero.findOne();
        let saved;
        if (existing) {
          await existing.update(payload);
          saved = existing;
        } else {
          saved = await SustainabilityHero.create(payload);
        }
        return status.responseStatus(res, 200, "Saved", saved);
      } catch (e) {
        return status.responseStatus(res, 500, e.message);
      }
    },
  },

  sdg: {
    list: async (req, res) => {
      try {
        const rows = await SdgCard.findAll({ order: [["order", "ASC"]] });
        return status.responseStatus(res, 200, "OK", rows);
      } catch (e) {
        return status.responseStatus(res, 500, e.message);
      }
    },
    create: async (req, res) => {
      try {
        const created = await SdgCard.create({
          number: req.body.number || 0,
          title: req.body.title || "",
          contribution: req.body.contribution || null,
          icon: req.body.icon || null,
          color: req.body.color || null,
          order: req.body.order || 0,
          isActive: req.body.isActive !== undefined ? !!req.body.isActive : true,
        });
        return status.responseStatus(res, 201, "Created", created);
      } catch (e) {
        return status.responseStatus(res, 500, e.message);
      }
    },
    update: async (req, res) => {
      try {
        const row = await SdgCard.findByPk(req.params.id);
        if (!row) return status.responseStatus(res, 404, "Not Found");
        await row.update({
          number: req.body.number ?? row.number,
          title: req.body.title ?? row.title,
          contribution: req.body.contribution ?? row.contribution,
          icon: req.body.icon ?? row.icon,
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
        const row = await SdgCard.findByPk(req.params.id);
        if (!row) return status.responseStatus(res, 404, "Not Found");
        await row.destroy();
        return status.responseStatus(res, 200, "Deleted");
      } catch (e) {
        return status.responseStatus(res, 500, e.message);
      }
    },
  },

  policies: {
    list: async (req, res) => {
      try {
        const rows = await Policy.findAll({ order: [["order", "ASC"]] });
        return status.responseStatus(res, 200, "OK", rows);
      } catch (e) {
        return status.responseStatus(res, 500, e.message);
      }
    },
    create: async (req, res) => {
      try {
        const created = await Policy.create({
          title: req.body.title || "",
          description: req.body.description || null,
          icon: req.body.icon || null,
          color: req.body.color || null,
          order: req.body.order || 0,
          isActive: req.body.isActive !== undefined ? !!req.body.isActive : true,
        });
        return status.responseStatus(res, 201, "Created", created);
      } catch (e) {
        return status.responseStatus(res, 500, e.message);
      }
    },
    update: async (req, res) => {
      try {
        const row = await Policy.findByPk(req.params.id);
        if (!row) return status.responseStatus(res, 404, "Not Found");
        await row.update({
          title: req.body.title ?? row.title,
          description: req.body.description ?? row.description,
          icon: req.body.icon ?? row.icon,
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
        const row = await Policy.findByPk(req.params.id);
        if (!row) return status.responseStatus(res, 404, "Not Found");
        await row.destroy();
        return status.responseStatus(res, 200, "Deleted");
      } catch (e) {
        return status.responseStatus(res, 500, e.message);
      }
    },
  },

  visionMission: {
    get: async (req, res) => {
      try {
        const row = await VisionMission.findOne();
        return status.responseStatus(res, 200, "OK", row);
      } catch (e) {
        return status.responseStatus(res, 500, e.message);
      }
    },
    upsert: async (req, res) => {
      try {
        const payload = {
          sectionTitle: req.body.sectionTitle || null,
          sectionSubtitle: req.body.sectionSubtitle || null,
          visionTitle: req.body.visionTitle || null,
          visionSubtitle: req.body.visionSubtitle || null,
          visionDescription: req.body.visionDescription || null,
          visionPoints: req.body.visionPoints || [],
          missionTitle: req.body.missionTitle || null,
          missionSubtitle: req.body.missionSubtitle || null,
          missionPoints: req.body.missionPoints || [],
          stats: req.body.stats || [],
          isActive: req.body.isActive !== undefined ? !!req.body.isActive : true,
        };
        const existing = await VisionMission.findOne();
        let saved;
        if (existing) {
          await existing.update(payload);
          saved = existing;
        } else {
          saved = await VisionMission.create(payload);
        }
        return status.responseStatus(res, 200, "Saved", saved);
      } catch (e) {
        return status.responseStatus(res, 500, e.message);
      }
    },
  },

  social: {
    get: async (req, res) => {
      try {
        const row = await SocialSection.findOne();
        return status.responseStatus(res, 200, "OK", row);
      } catch (e) {
        return status.responseStatus(res, 500, e.message);
      }
    },
    upsert: async (req, res) => {
      try {
        const payload = {
          sectionTitle: req.body.sectionTitle || null,
          sectionDescription: req.body.sectionDescription || null,
          isActive: req.body.isActive !== undefined ? !!req.body.isActive : true,
          csrCards: req.body.csrCards || [],
          csrImpactTitle: req.body.csrImpactTitle || null,
          csrImpactDescription: req.body.csrImpactDescription || null,
          csrImpactItems: req.body.csrImpactItems || [],
        };
        const existing = await SocialSection.findOne();
        let saved;
        if (existing) {
          await existing.update(payload);
          saved = existing;
        } else {
          saved = await SocialSection.create(payload);
        }
        return status.responseStatus(res, 200, "Saved", saved);
      } catch (e) {
        return status.responseStatus(res, 500, e.message);
      }
    },
  },

  footer: {
    get: async (req, res) => {
      try {
        const row = await FooterSection.findOne();
        return status.responseStatus(res, 200, "OK", row);
      } catch (e) {
        return status.responseStatus(res, 500, e.message);
      }
    },
    upsert: async (req, res) => {
      try {
        const payload = {
          title: req.body.title || null,
          subtitle: req.body.subtitle || null,
          ctaText: req.body.ctaText || null,
          ctaIcon: req.body.ctaIcon || null,
          backgroundImageUrl: req.body.backgroundImageUrl || null,
          isActive: req.body.isActive !== undefined ? !!req.body.isActive : true,
        };
        const existing = await FooterSection.findOne();
        let saved;
        if (existing) {
          await existing.update(payload);
          saved = existing;
        } else {
          saved = await FooterSection.create(payload);
        }
        return status.responseStatus(res, 200, "Saved", saved);
      } catch (e) {
        return status.responseStatus(res, 500, e.message);
      }
    },
  },

  innovationTransformation: {
    get: async (req, res) => {
      try {
        const row = await InnovationTransformation.findOne();
        return status.responseStatus(res, 200, "OK", row);
      } catch (e) {
        return status.responseStatus(res, 500, e.message);
      }
    },
    upsert: async (req, res) => {
      try {
        const payload = {
          sectionTitle: req.body.sectionTitle || "",
          sectionDescription: req.body.sectionDescription || null,
          isActive: req.body.isActive !== undefined ? !!req.body.isActive : true,
        };
        const existing = await InnovationTransformation.findOne();
        let saved;
        if (existing) {
          await existing.update(payload);
          saved = existing;
        } else {
          saved = await InnovationTransformation.create(payload);
        }
        return status.responseStatus(res, 200, "Saved", saved);
      } catch (e) {
        return status.responseStatus(res, 500, e.message);
      }
    },
  },

  digitalSolutions: {
    list: async (req, res) => {
      try {
        const rows = await DigitalSolution.findAll({ order: [["order", "ASC"]] });
        return status.responseStatus(res, 200, "OK", rows);
      } catch (e) {
        return status.responseStatus(res, 500, e.message);
      }
    },
    create: async (req, res) => {
      try {
        const created = await DigitalSolution.create({
          cardTitle: req.body.cardTitle || "",
          cardSubtitle: req.body.cardSubtitle || null,
          cardDescription: req.body.cardDescription || null,
          order: req.body.order || 0,
          isActive: req.body.isActive !== undefined ? !!req.body.isActive : true,
        });
        return status.responseStatus(res, 201, "Created", created);
      } catch (e) {
        return status.responseStatus(res, 500, e.message);
      }
    },
    update: async (req, res) => {
      try {
        const row = await DigitalSolution.findByPk(req.params.id);
        if (!row) return status.responseStatus(res, 404, "Not Found");
        await row.update({
          cardTitle: req.body.cardTitle ?? row.cardTitle,
          cardSubtitle: req.body.cardSubtitle ?? row.cardSubtitle,
          cardDescription: req.body.cardDescription ?? row.cardDescription,
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
        const row = await DigitalSolution.findByPk(req.params.id);
        if (!row) return status.responseStatus(res, 404, "Not Found");
        await row.destroy();
        return status.responseStatus(res, 200, "Deleted");
      } catch (e) {
        return status.responseStatus(res, 500, e.message);
      }
    },
  },

  researchInnovations: {
    list: async (req, res) => {
      try {
        const rows = await ResearchInnovation.findAll({ order: [["order", "ASC"]] });
        return status.responseStatus(res, 200, "OK", rows);
      } catch (e) {
        return status.responseStatus(res, 500, e.message);
      }
    },
    create: async (req, res) => {
      try {
        const created = await ResearchInnovation.create({
          cardTitle: req.body.cardTitle || "",
          cardSubtitle: req.body.cardSubtitle || null,
          cardDescription: req.body.cardDescription || null,
          order: req.body.order || 0,
          isActive: req.body.isActive !== undefined ? !!req.body.isActive : true,
        });
        return status.responseStatus(res, 201, "Created", created);
      } catch (e) {
        return status.responseStatus(res, 500, e.message);
      }
    },
    update: async (req, res) => {
      try {
        const row = await ResearchInnovation.findByPk(req.params.id);
        if (!row) return status.responseStatus(res, 404, "Not Found");
        await row.update({
          cardTitle: req.body.cardTitle ?? row.cardTitle,
          cardSubtitle: req.body.cardSubtitle ?? row.cardSubtitle,
          cardDescription: req.body.cardDescription ?? row.cardDescription,
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
        const row = await ResearchInnovation.findByPk(req.params.id);
        if (!row) return status.responseStatus(res, 404, "Not Found");
        await row.destroy();
        return status.responseStatus(res, 200, "Deleted");
      } catch (e) {
        return status.responseStatus(res, 500, e.message);
      }
    },
  },

  // Sustainability — The Heart of Our Progress
  heart: {
    get: async (req, res) => {
      try {
        const row = await SustainabilityHeart.findOne();
        return status.responseStatus(res, 200, "OK", row);
      } catch (e) {
        return status.responseStatus(res, 500, e.message);
      }
    },
    upsert: async (req, res) => {
      try {
        const payload = {
          mainTitle: req.body.mainTitle || null,
          mainSubtitle: req.body.mainSubtitle || null,
          sections: Array.isArray(req.body.sections) ? req.body.sections : [],
          commitments: Array.isArray(req.body.commitments) ? req.body.commitments : [],
          isActive: req.body.isActive !== undefined ? !!req.body.isActive : true,
        };
        const existing = await SustainabilityHeart.findOne();
        let saved;
        if (existing) {
          await existing.update(payload);
          saved = existing;
        } else {
          saved = await SustainabilityHeart.create(payload);
        }
        return status.responseStatus(res, 200, "Saved", saved);
      } catch (e) {
        return status.responseStatus(res, 500, e.message);
      }
    },
  },
};


