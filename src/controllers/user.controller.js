import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessandRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refershToken = user.generateRefreshToken();

    user.refershToken = refershToken; // add in the user object
    await user.save({ vaidateBeforeSave: false }); //refresh token is saved in the database

    return { accessToken, refershToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token "
    );
  }
};
const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  //validation - not empty
  //check if user already exists : username ,email
  //check for images , check for avtaar
  //uploads them to cloudinary, avtaar
  //create user object - create entry in db
  //remove password and refresh token fields from response
  //check for user creation
  //return response

  const { fullName, email, username, password } = req.body;

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "This field is required");
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User Already existed");
  }
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  //This is the second option where we can check it optionally the coverImage sometimes it is giving an error undefined
  // let coverImageLocalPath;
  // if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.lenth > 0 ){
  //   coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  // }

  //checking for the Avatar and the cover Image
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required ");
  }

  // This is a function where I am uploading the coverImage and avatar on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required ");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(400, " Something went wrong while creating the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Register Successfully "));
});

const loginUser = asyncHandler(async (req, res) => {
  //req body - data
  //username or email
  //find the user
  //password check
  //access token adn refresh token
  //send cookies

  const { username, email, password } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "username or email is required ");
  }

  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials ");
  }

  const { refershToken, accessToken } = await generateAccessandRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  ); // select will remove password or refersh token

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refershToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refershToken,
        },
        "User LoggedIn Successfully "
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refershToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged out Successfuly"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refershToken || req.body.refershToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Aunautorised request");
  }
 try {
   const decodedToken = jwt.verify(
     incomingRefreshToken,
     process.env.REFRESH_TOKEN_SECRET
   );
 
   const user = await User.findById(decodedToken?._id);
   if (!user) {
     throw new ApiError(401, "Invalid Refresh token");
   }
   if(incomingRefreshToken !== user?.refershToken){
        throw new ApiError(401, "Refresh token is expired or used");
 
   }
 const options ={
   httpOnly: true,
   secure: true 
 }
   const {accessToken, newrefershToken } = await generateAccessandRefreshTokens(user._id);
   return res
     .status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken", newrefershToken, options)
     .json(
       new ApiResponse(
         200,
         {
           accessToken,
           refershToken : newrefershToken,
         },
         "Access Token Refresh successfuly"
       )
     );
 } catch (error) {
  throw new ApiError(401 ,error?.message ||  "Invalid refresh token ")
  
 }
  
});

export { registerUser, loginUser, logoutUser, refreshAccessToken};
