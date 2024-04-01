import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadFile } from "../utils/fileUploader.js";
import { apiResponse } from "../utils/apiResponse.js";

const generateAccessTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();

    user.token = accessToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken };
  } catch (error) {
    throw new apiError(
      500,
      error,
      "Something went wrong while generating access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // 1. Get user Detail
  // 2. Validation check everything not empty
  // 3. Check if user already exist
  // 4. Check for images
  // 5. Upload them to cloudinary, avatar check
  // 6. Create user object - create entry in db
  // 7. remove password from response
  // 8. check for user creation
  // 9. Return response

  const { fullName, email, password, avatar } = req.body;

  if ([fullName, email, password].some((field) => field?.trim() === "")) {
    throw new apiError(400, "All field are required");
  }

  if (await User.findOne({ $or: [{ email }] })) {
    throw new apiError(409, "User Email is existed");
  }

  let avatarPath, avatarUploadResponse;
  if (req.files && Array.isArray(req.files.avatar)) {
    avatarPath = req.files?.avatar[0]?.path;
  }
  if (avatarPath) {
    avatarUploadResponse = await uploadFile(avatarPath);
  }

  const createResponse = await User.create({
    fullName,
    avatar: avatarUploadResponse?.url || "",
    email,
    password,
  });

  const createdUser = await User.findById(createResponse?._id).select(
    "-password"
  );

  if (createdUser) {
    return res
      .status(201)
      .json(new apiResponse(201, createdUser, "User Registered Successfully"));
  } else {
    throw new apiError(500, "Error Creating User");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  // Email and Password
  // Check email and password is available
  // Find the user
  // check Password
  // accessToken

  const { email, password } = req.body;

  if (!email || !password) {
    throw new apiError(400, "All fields are required");
  }

  const checkIsAvailable = await User.findOne({ $or: [{ email }] });
  if (!checkIsAvailable) {
    throw new apiError(400, "User does not exist");
  }

  const isPasswordValid = await checkIsAvailable.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new apiError(401, "Password is Invalid");
  }

  const { accessToken } = await generateAccessTokens(checkIsAvailable._id);

  const loggedInUser = await User.findById(checkIsAvailable._id).select(
    "-password"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("token", accessToken, options)
    .json(
      new apiResponse(
        200,
        { user: loggedInUser },
        "User LoggedIn Successfully!!!"
      )
    );
});

const logout = asyncHandler(async (req, res) => {
  const loggedOutUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        token: null,
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
    .clearCookie("token", options)
    .json(new apiResponse(200, loggedOutUser, "User Logged Out"));
});

export { registerUser, loginUser, logout };
