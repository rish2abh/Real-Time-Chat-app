const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { sendSuccess, sendError, asyncHandler } = require("../utils");

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    console.warn("register blocked: duplicate email", email);
    return sendError(res, 400, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword
  });

  return sendSuccess(res, 201, "Registration successful", {
    id: user._id,
    name: user.name,
    email: user.email,
    status: user.status
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    console.warn("login failed: invalid credentials for", email);
    return sendError(res, 401, "Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    console.warn("login failed: invalid password for", email);
    return sendError(res, 401, "Invalid credentials");
  }

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return sendSuccess(res, 200, "Login successful", {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      status: user.status
    }
  });
});

module.exports = {
  register,
  login
};
