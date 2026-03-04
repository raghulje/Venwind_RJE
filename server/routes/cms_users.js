const router = require("express").Router();
const usersController = require("../controllers/users");
const validation = require("../middlewares/userValidator");

// CMS User Management Routes (simpler auth - just check if logged in)
router.get("/", usersController.getAllUsers);
router.post("/", validation.createUserSchema, usersController.createUser);
router.get("/:id", usersController.getUserById);
router.put("/:id", validation.createUserSchema, usersController.updateUserById);
router.delete("/:id", usersController.deleteUserById);
router.patch("/:id/password", usersController.changePassword);

module.exports = router;

