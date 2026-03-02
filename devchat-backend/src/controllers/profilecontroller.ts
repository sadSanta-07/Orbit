import { Response } from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary";
import User from "../models/User";
import Room from "../models/Room";
import { AuthRequest } from "../middleware/authmiddleware";

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files are allowed"));
    } else {
      cb(null, true);
    }
  },
});

import sharp from "sharp";

export const updateProfilePic = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const userId = req.user.userId;


    const compressedImage = await sharp(req.file.buffer)
      .resize(300, 300)
      .jpeg({ quality: 80 })
      .toBuffer();


    const uploadToCloudinary = (): Promise<any> => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "orbit_profiles" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        stream.end(compressedImage);
      });
    };

    const result: any = await uploadToCloudinary();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: result.secure_url },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      profilePic: result.secure_url,
      user: updatedUser,
    });

  } catch (error) {
    console.error("PROFILE PIC ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user!.userId;
    const { username, bio, address } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, bio, ...(address !== undefined && { address }) },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });

  } catch (error) {
    console.error("PROFILE UPDATE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getMe = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const user = await User.findById(req.user!.userId)
      .select("-password");

    return res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const deleteAccount = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user!.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Remove profile pic from Cloudinary if it exists
    if (user.profilePic) {
      try {
        // Extract public_id from Cloudinary URL
        // e.g. https://res.cloudinary.com/<cloud>/image/upload/v123/orbit_profiles/abc.jpg
        const parts = user.profilePic.split("/");
        const uploadIdx = parts.indexOf("upload");
        if (uploadIdx !== -1) {
          // Skip the version segment (v123) if present
          let publicIdParts = parts.slice(uploadIdx + 1);
          if (publicIdParts[0]?.startsWith("v") && /^v\d+$/.test(publicIdParts[0])) {
            publicIdParts = publicIdParts.slice(1);
          }
          const publicId = publicIdParts.join("/").replace(/\.[^/.]+$/, ""); // strip extension
          await cloudinary.uploader.destroy(publicId);
        }
      } catch (cloudErr) {
        console.error("Cloudinary delete error:", cloudErr);
        // Continue with account deletion even if Cloudinary fails
      }
    }

    // Remove user from all rooms they're a member of
    await Room.updateMany(
      { members: userId },
      { $pull: { members: userId } }
    );

    // Delete the user
    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });

  } catch (error) {
    console.error("DELETE ACCOUNT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};