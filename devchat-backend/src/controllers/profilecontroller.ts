import { Response } from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary";
import User from "../models/User";
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
    const { username, bio } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, bio },
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