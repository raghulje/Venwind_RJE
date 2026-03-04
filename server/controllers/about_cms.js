const { AboutHero, AboutVisionMission, AboutSection, LeadershipMember, ValueItem, JourneyItem, AboutJourney } = require("../models");
const status = require("../helpers/response");

function asyncHandler(fn) {
  return (req, res) => fn(req, res).catch((e) => status.responseStatus(res, 500, "Internal error", { error: e.message }));
}

exports.getAll = asyncHandler(async (req, res) => {
  const [hero, vm, sections, leaders, values, journey, aboutJourney] = await Promise.all([
    AboutHero.findOne({ order: [["id", "DESC"]] }),
    AboutVisionMission.findOne({ order: [["id", "DESC"]] }),
    AboutSection.findAll({ order: [["order", "ASC"]] }),
    LeadershipMember.findAll({ order: [["order", "ASC"]] }),
    ValueItem.findAll({ order: [["order", "ASC"]] }),
    JourneyItem.findAll({ order: [["order", "ASC"]] }),
    AboutJourney.findOne({ order: [["id", "DESC"]] }),
  ]);

  // parse JSON fields
  const vmData = vm ? { ...vm.toJSON(), missionPoints: safeParse(vm.missionPointsJson, []) } : null;
  const leadersData = leaders.map((l) => ({ ...l.toJSON(), achievements: safeParse(l.achievementsJson, []) }));

  return status.responseStatus(res, 200, "OK", {
    hero,
    visionMission: vmData,
    sections,
    leadership: leadersData,
    values,
    journey,
    aboutJourney,
  });
});

function safeParse(str, def) {
  try {
    return str ? JSON.parse(str) : def;
  } catch (_) {
    return def;
  }
}

function buildSingleUpsert(Model, mapIn, mapOut) {
  return asyncHandler(async (req, res) => {
    const payload = mapIn(req.body || {});
    let row = await Model.findOne({ order: [["id", "DESC"]] });
    if (!row) {
      row = await Model.create(payload);
    } else {
      await row.update(payload);
    }
    const out = mapOut ? mapOut(row.toJSON()) : row;
    return status.responseStatus(res, 200, "Saved", out);
  });
}

exports.saveHero = buildSingleUpsert(
  AboutHero,
  (b) => ({
    title: b.title,
    subtitle: b.subtitle,
    description: b.description,
    backgroundImage: b.backgroundImage,
    logoCards: Array.isArray(b.logoCards) ? b.logoCards : (b.logoCards ? (()=>{ try { return JSON.parse(b.logoCards); } catch { return []; } })() : []),
    isActive: b.isActive !== false,
  }),
  undefined
);

exports.saveVisionMission = buildSingleUpsert(
  AboutVisionMission,
  (b) => ({
    visionTitle: b.visionTitle,
    visionDescription: b.visionDescription,
    visionImage: b.visionImage,
    missionTitle: b.missionTitle,
    missionImage: b.missionImage,
    missionPointsJson: JSON.stringify(b.missionPoints || []),
    isActive: b.isActive !== false,
  }),
  (row) => ({ ...row, missionPoints: safeParse(row.missionPointsJson, []) })
);

exports.saveAboutJourney = buildSingleUpsert(
  AboutJourney,
  (b) => ({
    title: b.title,
    summary: b.summary,
    image: b.image, // Keep for backward compatibility
    images: Array.isArray(b.images) ? b.images : (b.images ? (()=>{ try { return JSON.parse(b.images); } catch { return []; } })() : []),
    isActive: b.isActive !== false,
  }),
  undefined
);

// New function to handle About Journey with image uploads
exports.saveAboutJourneyWithImages = asyncHandler(async (req, res) => {
  try {
    console.log('About Journey upload endpoint accessed:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      files: req.files ? req.files.length : 0
    });
    
    const { title, summary, image, isActive } = req.body;
    
    // Process uploaded images
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `/uploads/images/${file.filename}`);
    }
    
    // If images were provided in the request body (from existing data), merge them
    let existingImages = [];
    if (req.body.images) {
      try {
        existingImages = Array.isArray(req.body.images) ? req.body.images : JSON.parse(req.body.images);
      } catch (e) {
        existingImages = [];
      }
    }
    
    // Combine existing images with new uploaded images
    const allImages = [...existingImages, ...imageUrls];
    
    // Find existing record or create new one
    let journeyRecord = await AboutJourney.findOne({ order: [["id", "DESC"]] });
    
    if (journeyRecord) {
      // Update existing record
      await journeyRecord.update({
        title: title || journeyRecord.title,
        summary: summary || journeyRecord.summary,
        image: image || journeyRecord.image,
        images: allImages.length > 0 ? allImages : journeyRecord.images,
        isActive: isActive !== undefined ? isActive : journeyRecord.isActive,
      });
    } else {
      // Create new record
      journeyRecord = await AboutJourney.create({
        title: title || 'Our Journey',
        summary: summary || '',
        image: image || '',
        images: allImages,
        isActive: isActive !== undefined ? isActive : true,
      });
    }
    
    return status.responseStatus(res, 200, "About Journey saved successfully", journeyRecord);
  } catch (error) {
    console.error('Error saving About Journey with images:', error);
    return status.responseStatus(res, 500, "Internal server error", { error: error.message });
  }
});

function buildCrud(Model, mapIn, mapOut) {
  return {
    list: asyncHandler(async (req, res) => {
      const rows = await Model.findAll({ order: [["order", "ASC"]] });
      return status.responseStatus(res, 200, "OK", rows.map((r) => (mapOut ? mapOut(r.toJSON()) : r)));
    }),
    create: asyncHandler(async (req, res) => {
      const row = await Model.create(mapIn ? mapIn(req.body || {}) : req.body || {});
      return status.responseStatus(res, 201, "Created", mapOut ? mapOut(row.toJSON()) : row);
    }),
    update: asyncHandler(async (req, res) => {
      const { id } = req.params;
      const row = await Model.findByPk(id);
      if (!row) return status.responseStatus(res, 404, "Not found");
      await row.update(mapIn ? mapIn(req.body || {}) : req.body || {});
      return status.responseStatus(res, 200, "Updated", mapOut ? mapOut(row.toJSON()) : row);
    }),
    remove: asyncHandler(async (req, res) => {
      const { id } = req.params;
      const row = await Model.findByPk(id);
      if (!row) return status.responseStatus(res, 404, "Not found");
      await row.destroy();
      return status.responseStatus(res, 200, "Deleted");
    }),
  };
}

exports.sections = buildCrud(AboutSection);
exports.values = buildCrud(ValueItem);
exports.journey = buildCrud(JourneyItem);
exports.leadership = buildCrud(
  LeadershipMember,
  (b) => ({
    name: b.name,
    position: b.position,
    category: b.category,
    description: b.description,
    achievementsJson: JSON.stringify(b.achievements || []),
    experience: b.experience,
    education: b.education,
    image: b.image,
    color: b.color,
    order: b.order || 0,
    isActive: b.isActive !== false,
  }),
  (row) => ({ ...row, achievements: safeParse(row.achievementsJson, []) })
);


