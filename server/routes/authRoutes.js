const express = require("express");
const router = express.Router();

const { registerUser, loginUser, getMe, changePassword, updateProfile, updateNotificationPreference, deleteAccount } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { getMaxListeners } = require("../models/User");



// Register Route
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe)
router.put("/change-password", protect, changePassword);
router.put("/profile", protect, updateProfile);
router.put("/notifications", protect, updateNotificationPreference)
router.delete("/account", protect, deleteAccount);
module.exports = router;