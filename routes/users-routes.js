const express = require("express");
const router = express.Router();
const fileUpload =require('../middleware/file-upload')
const { check } = require("express-validator");

const usercontrollers = require("../controllers/user-controller");
router.get("/", usercontrollers.getUsers);
router.post(
  "/signup",
  fileUpload.single('image'),
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 10 }),
  ],
  usercontrollers.Signup
);
router.post(
  "/login",
  [
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 10 }),
  ],
  usercontrollers.Login
);

module.exports = router;
