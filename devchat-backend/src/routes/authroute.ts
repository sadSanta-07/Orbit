import { updateProfilePic, upload, updateProfile,getMe } from "../controllers/profilecontroller";
import { protect } from "../middleware/authmiddleware";
import express from "express";
import { register, login } from "../controllers/authcontroller";
const router = express.Router();

router.put(
    "/profile-pic",
    protect,
    upload.single("image"),
    updateProfilePic
);
router.put("/update-profile", protect, updateProfile);
router.get("/me", protect, getMe);
router.post("/register", register);
router.post("/login", login);

export default router;