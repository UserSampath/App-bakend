const express = require("express");
const router = express.Router();
const {
  login,
  signup,
  generateOTP,
  resetPassword,
} = require("../controllers/user");


router.post("/login", login);
router.post("/signup", signup);
router.post("/generateOTP", generateOTP);
router.post("/resetPassword", resetPassword);
module.exports = router;
