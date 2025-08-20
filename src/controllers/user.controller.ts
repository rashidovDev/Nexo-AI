import { NextFunction, Request, Response } from "express";
import { commonObject } from "../libs/types/common";
import { UserInput, User, LoginInput, ExtendedRequest, UserUpdateInput } from "../libs/types/user";
import UserService from "../services/User.service";
import Errors, { HttpCode, Message } from "../libs/utils/Error";
import AuthService from "../services/Auth.service";
import UserModel from "../models/User.model";
import { TOKEN_TIME } from "../libs/utils/config";
import cloudinary from "../libs/cloudinary/cloudinary";
import fileUpload from "express-fileupload";
import { registerSchema } from "@/libs/utils/validator";

// Services 
const userService = new UserService();
const authService = new AuthService();

const userController : commonObject = {};

/**
 * SIGNUP
 */
userController.signup = async (req: Request, res: Response) => {
  try {
    const input : UserInput = req.body;

    if(!input.userPassword! || !input.userEmail || !input.username){
      res.status(HttpCode.BAD_REQUEST).json({message : Message.INVALID_CREDENTIALS})
    } 
      const candidate = await UserModel.findOne({
    $or: [
    { username: input.username },
    { phone: input.userEmail }
    ]
  });
      if(candidate){
      res.status(HttpCode.BAD_REQUEST).json({message : Message.USED_USERNAME_PHONE})
      }
    const result: User = await userService.signup(input);
    // Create tokens
    const accessToken = await authService.createAccessToken(result);
    const refreshToken = await authService.createRefreshToken(result);

    // Store refresh token securely
    res.cookie("refreshToken", refreshToken, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Access token can be sent directly
    res.status(HttpCode.CREATED).json({
      user: result,
      accessToken
    });

  } catch (err) {
    console.log("Error, signup:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

/**
 * LOGIN
 */
userController.login = async (req: Request, res: Response) => {
  try {
    const input: LoginInput = req.body;
    
    const result = await userService.login(input);
    // Generate tokens
    const accessToken = await authService.createAccessToken(result.user);
    const refreshToken = await authService.createRefreshToken(result.user);

    // Store refresh token in secure cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(HttpCode.OK).json({
      user: result,
      accessToken
    });

  } catch (err) {
    console.log("Error, login:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

/**
 * REFRESH TOKEN
 */
userController.refreshToken = async (req: Request, res: Response) => {
  try {
    console.log("refreshToken");
    const token = req.cookies.refreshToken;
    if (!token) {
      throw new Errors(HttpCode.UNAUTHORIZED, Message.INVALID_TOKEN);
    }

    const { accessToken, refreshToken } = await authService.rotateTokens(token);

    // Update refresh token in cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(HttpCode.OK).json({ accessToken });

  } catch (err) {
    console.log("Error, refreshToken:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

userController.uploadProfileImage = async (req: ExtendedRequest, res: Response) => {
  try {
    const userId = req.user._id;

    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.files.file as fileUpload.UploadedFile;

    // Find user to delete old image if exists
    const user = await UserModel.findById(userId);
    if (user?.userImage?.public_id) {
      await cloudinary.uploader.destroy(user.userImage.public_id);
    }

    // Upload new image
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "profile_images",
    });

    // Save as object in userImage
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        userImage: {
          url: result.secure_url,
          public_id: result.public_id,
        },
      },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (err) {
    console.log("Error in uploadImage:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

userController.deleteProfileImage = async (req: ExtendedRequest, res: Response) => {
  try {
    const userId = req.user._id;

    // Find user
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(HttpCode.NOT_FOUND).json({ error: Message.NO_DATA_FOUND });
    }

    // Check if user has an image to delete
    if (!user.userImage?.public_id) {
      return res.status(HttpCode.BAD_REQUEST).json({ error: Message.NOT_UPLOADED });
    }

    // Delete image from Cloudinary
    await cloudinary.uploader.destroy(user.userImage.public_id);

    // Remove userImage object from DB
    user.userImage = undefined;
    await user.save();

    res.status(HttpCode.OK).json({ message: Message.DELETE_SUCCESS });
  } catch (err) {
    console.log("Error in deleteProfileImage:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

/**
 * LOGOUT
 */
userController.logout = (req: ExtendedRequest, res: Response) => {
  try {
    console.log("logout");
    res.clearCookie("refreshToken");
    res.status(HttpCode.OK).json({ logout: true });
  } catch (err) {
    console.log("Error, logout:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

/**
 * GET MEMBER DETAILS
 */
userController.getUserDetails = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("getMemberDetails");
    const result = await userService.getUserDetails(req.user);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getMemberDetails:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

userController.searchUser = async (req: ExtendedRequest, res: Response) => {
  try {
    const searchParam = req.query.search;
    const search = typeof searchParam === "string" ? searchParam : "";
    const result = await userService.searchUserByUsername(search);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getMemberDetails:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

userController.getUserById = async (req: ExtendedRequest, res: Response) => {
  try {
    const userId = req.params.userId;
    const result = await userService.getUserById(userId);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getUserById:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

userController.getAllUsers = async (req: ExtendedRequest, res: Response) => {
  try {
    const result = await userService.getAllUsers();
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getAllUsers:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

export default userController;