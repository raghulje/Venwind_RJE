const router = require("express").Router();
const ctrl = require("../controllers/capabilities_cms");
const auth = require("../middlewares/auth");

// Aggregate
router.get("/", ctrl.getAll);

// Hero
router.get("/hero", ctrl.hero.get);
router.put("/hero", ctrl.hero.upsert);

// Research
router.get("/research", ctrl.research.get);
router.post("/research", ctrl.research.create);
router.put("/research", ctrl.research.upsert);
router.put("/research/:id", ctrl.research.update);

// Facilities
router.get("/facilities", ctrl.facilities.list);
router.post("/facilities", ctrl.facilities.create);
router.put("/facilities/:id", ctrl.facilities.update);
router.delete("/facilities/:id", ctrl.facilities.remove);

module.exports = router;


