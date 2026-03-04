const router = require("express").Router();
const ctrl = require("../controllers/sustainability_cms");
const auth = require("../middlewares/auth");

// Aggregate
router.get("/", ctrl.getAll);

// Hero
router.get("/hero", ctrl.hero.get);
router.put("/hero", ctrl.hero.upsert);

// SDG Cards
router.get("/sdg", ctrl.sdg.list);
router.post("/sdg", ctrl.sdg.create);
router.put("/sdg/:id", ctrl.sdg.update);
router.delete("/sdg/:id", ctrl.sdg.remove);

// Policies
router.get("/policies", ctrl.policies.list);
router.post("/policies", ctrl.policies.create);
router.put("/policies/:id", ctrl.policies.update);
router.delete("/policies/:id", ctrl.policies.remove);

// Vision & Mission
router.get("/vision-mission", ctrl.visionMission.get);
router.put("/vision-mission", ctrl.visionMission.upsert);

// Social
router.get("/social", ctrl.social.get);
router.put("/social", ctrl.social.upsert);

// Footer
router.get("/footer", ctrl.footer.get);
router.put("/footer", ctrl.footer.upsert);

// Innovation & Transformation
router.get("/innovation-transformation", ctrl.innovationTransformation.get);
router.put("/innovation-transformation", ctrl.innovationTransformation.upsert);

// Digital Solutions
router.get("/digital-solutions", ctrl.digitalSolutions.list);
router.post("/digital-solutions", ctrl.digitalSolutions.create);
router.put("/digital-solutions/:id", ctrl.digitalSolutions.update);
router.delete("/digital-solutions/:id", ctrl.digitalSolutions.remove);

// Research & Innovation
router.get("/research-innovations", ctrl.researchInnovations.list);
router.post("/research-innovations", ctrl.researchInnovations.create);
router.put("/research-innovations/:id", ctrl.researchInnovations.update);
router.delete("/research-innovations/:id", ctrl.researchInnovations.remove);

// Sustainability — The Heart of Our Progress
router.get("/heart", ctrl.heart.get);
router.put("/heart", ctrl.heart.upsert);

module.exports = router;


