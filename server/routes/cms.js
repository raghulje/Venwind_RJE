const router = require("express").Router();
const { getCms, updateCms } = require("../controllers/cms");
const auth = require("../middlewares/auth");

router.get("/", getCms);
router.put("/", auth.authCheck, updateCms);

module.exports = router;


