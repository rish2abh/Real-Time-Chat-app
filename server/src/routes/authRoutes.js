const express = require("express");
const router = express.Router();

const {
  register,
  login
} = require("../controllers");
const { validate } = require("../middleware");
const {
  registerSchema,
  loginSchema
} = require("../validations");

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

module.exports = router;
