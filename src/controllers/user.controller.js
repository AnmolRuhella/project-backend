import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse} from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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
  )
  if(!createdUser){
      throw new ApiError(400, " Something went wrong while creating the user");
  }

  return res.status(201).json(
    new ApiResponse (200 ,createdUser , "User Register Successfully ")

  )


});

export { registerUser };
