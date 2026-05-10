const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

jest.mock("../models", () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn()
  }
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn()
}));

jest.mock("../utils", () => ({
  sendSuccess: jest.fn(),
  sendError: jest.fn(),
  asyncHandler: (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
}));

const { register, login } = require("./authController");
const { User } = require("../models");
const { sendSuccess, sendError } = require("../utils");

const createResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
});

describe("Auth Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("register should create a new user when email is not taken", async () => {
    const req = {
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "password123"
      }
    };

    const res = createResponse();

    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashed-password");
    User.create.mockResolvedValue({
      _id: "user-id",
      name: "Test User",
      email: "test@example.com",
      status: "offline"
    });

    await register(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    expect(User.create).toHaveBeenCalledWith({
      name: "Test User",
      email: "test@example.com",
      password: "hashed-password"
    });
    expect(sendSuccess).toHaveBeenCalledWith(res, 201, "Registration successful", {
      id: "user-id",
      name: "Test User",
      email: "test@example.com",
      status: "offline"
    });
  });

  test("register should return error when user already exists", async () => {
    const req = {
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "password123"
      }
    };

    const res = createResponse();

    User.findOne.mockResolvedValue({ email: "test@example.com" });

    await register(req, res);

    expect(sendError).toHaveBeenCalledWith(res, 400, "User already exists");
  });

  test("login should return error for invalid credentials", async () => {
    const req = {
      body: {
        email: "test@example.com",
        password: "password123"
      }
    };

    const res = createResponse();

    User.findOne.mockResolvedValue(null);

    await login(req, res);

    expect(sendError).toHaveBeenCalledWith(res, 401, "Invalid credentials");
  });

  test("login should return error when password is invalid", async () => {
    const req = {
      body: {
        email: "test@example.com",
        password: "wrong-password"
      }
    };

    const res = createResponse();

    User.findOne.mockResolvedValue({
      _id: "user-id",
      email: "test@example.com",
      password: "hashed-password"
    });
    bcrypt.compare.mockResolvedValue(false);

    await login(req, res);

    expect(sendError).toHaveBeenCalledWith(res, 401, "Invalid credentials");
  });

  test("login should return token and user data on success", async () => {
    const req = {
      body: {
        email: "test@example.com",
        password: "password123"
      }
    };

    const res = createResponse();

    User.findOne.mockResolvedValue({
      _id: "user-id",
      name: "Test User",
      email: "test@example.com",
      password: "hashed-password",
      status: "offline"
    });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("token-value");

    await login(req, res);

    expect(bcrypt.compare).toHaveBeenCalledWith("password123", "hashed-password");
    expect(jwt.sign).toHaveBeenCalledWith(
      { userId: "user-id" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    expect(sendSuccess).toHaveBeenCalledWith(res, 200, "Login successful", {
      token: "token-value",
      user: {
        id: "user-id",
        name: "Test User",
        email: "test@example.com",
        status: "offline"
      }
    });
  });
});
