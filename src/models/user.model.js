import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // cloudinary url
      required: true,
    },
    coverImage: {
      type: String, // cloudinary url
      required: true,
    },
    watchHistory: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    password: {
      type: String,
      require: [true, "Password is required "],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) return next();
  // here we are checking if password is modified then only encrypt the password and save it into the db .
  this.password = bcrypt.hash(this.password, 10); // 10 signify here is the round how can round of algo we want to run
  next();
});
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password); // it will compare the encrypt password and provide password by the user in string
};

userSchema.methods.generateAccessToken = function () { // function to create the jwt token 
  return jwt.sign(
    {
      _id: this.id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiredIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generateRefreshToken = function () { // function to create the refresh token 
  return jwt.sign(
    {
      _id: this.id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiredIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};
// this is the mongoose hooks that is runnning before the save into the mongoDB  we are not here using the arrow function as callback because didnt catch the context

export const User = mongoose.model("User", userSchema);
