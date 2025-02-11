import { registerController, loginController, forgotPasswordController, updateProfileController } from "./authController";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import { comparePassword, hashPassword } from "./../helpers/authHelper.js";
import JWT from "jsonwebtoken";

jest.mock("../models/userModel");
jest.mock("../helpers/authHelper");
jest.mock("jsonwebtoken");

describe("test registerController", () => {
  let req, res;

  // Set up mock request and response objects
  beforeEach(() => {
    req = {
      body: {
        name: "John Doe",
        email: "test@example.com",
        password: "password",
        phone: "12345678",
        address: "123 Main St",
        answer: "answer",
      },
    };
    res = {
      send: jest.fn(),
      status: jest.fn(() => res),
    };
  });

  it("should return error if name is missing", async () => {
    delete req.body.name;
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ error: "Name is Required" });
  });

  it("should return error if email is missing", async () => {
    delete req.body.email;
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Email is Required" });
  });

  it("should return error if password is missing", async () => {
    delete req.body.password;
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Password is Required" });
  });

  it("should return error if phone is missing", async () => {
    delete req.body.phone;
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Phone no is Required" });
  });

  it("should return error if address is missing", async () => {
    delete req.body.address;
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Address is Required" });
  });

  it("should return error if answer is missing", async () => {
    delete req.body.answer;
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Answer is Required" });
  });

  it("should return error if user already exists", async () => {
    userModel.findOne.mockResolvedValueOnce({ email: "test@example.com"});
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({ success: false, message: "Already Register please login" });
  });

  it("should return 500 with message of error if error occurs", async () => {
    userModel.findOne.mockRejectedValueOnce("Database Error");
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ success: false, message: "Error in Registeration", error: "Database Error" });
  });

  it("should register user if all fields are valid and user does not exist", async () => {
    userModel.findOne.mockResolvedValueOnce(null);
    hashPassword.mockResolvedValueOnce("hashedPassword");
    userModel.mockReturnValueOnce({ save: jest.fn().mockResolvedValueOnce({ name: "John Doe" }) });
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({ success: true, message: "User Register Successfully", 
      user: expect.objectContaining({
        name: "John Doe",
      }),
    });
  });
});

describe("test loginController", () => {
  let req, res;

  // Set up mock request and response objects
  beforeEach(() => {
    req = {
      body: {
        email: "test@example.com",
        password: "password",
      },
    };
    res = {
      send: jest.fn(),
      status: jest.fn(() => res),
    };
  });

  it("should return 404 with message that either email or password is invalid if email is missing", async () => {
    delete req.body.email;
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({success: false, message: "Invalid email or password" });
  });

  it("should return 404 with message that either email or password is invalid if password is missing", async () => {
    delete req.body.password;
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({success: false, message: "Invalid email or password" });
  });

  it("should return 404 with message that email is not registered if user does not exist", async () => {
    userModel.findOne.mockResolvedValueOnce(null);
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({success: false, message: "Email is not registerd" });
  });

  it("should return 200 with message that password is incorrect if password does not match", async () => {
    userModel.findOne.mockResolvedValueOnce({ email: "test@example.com", password: "incorrectHashedPassword" });
    comparePassword.mockResolvedValueOnce(false);
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({success: false, message: "Invalid Password" });
  });

  it("should return 500 if an error occurs", async () => {
    userModel.findOne.mockRejectedValueOnce("Database Error");
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({success: false, message: "Error in login", error: "Database Error" });
  });

  it("should return 200 with user and token if login is successful", async () => {
    userModel.findOne.mockResolvedValueOnce({ 
      _id: "1",
      name: "John Doe",
      email: "test@example.com",
      phone: "12345678",
      address: "123 Main St",
      role: "user",
      password: "hashedPassword",
    });
    comparePassword.mockResolvedValueOnce(true);
    JWT.sign.mockResolvedValueOnce("usertoken");
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({success: true, message: "login successfully",
      user: {
        _id: "1",
        name: "John Doe",
        email: "test@example.com",
        phone: "12345678",
        address: "123 Main St",
        role: "user",
      },
      token: "usertoken",
    });
  });
});

describe("test forgotPasswordController", () => {
  let req, res;

  // Set up mock request and response objects
  beforeEach(() => {
    req = {
      body: {
        email: "test@example.com",
        answer: "answer",
        newPassword: "newPassword",
      },
    };
    res = {
      send: jest.fn(),
      status: jest.fn(() => res),
    };
  });

  it("should return 400 with message that email is required if email is missing", async () => {
    delete req.body.email;
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: "Email is required" });
  });

  it("should return 400 with message that answer is required if answer is missing", async () => {
    delete req.body.answer;
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: "Answer is required" });
  });

  it("should return 400 with message that new password is required if new password is missing", async () => {
    delete req.body.newPassword;
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: "New Password is required" });
  });

  it("should return 500 with message of error if error occurs", async () => {
    userModel.findOne.mockRejectedValueOnce("Database Error");
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ success: false, message: "Something went wrong", error: "Database Error" });
  });

  it("should return 404 with message that email or answer is wrong if email and answer combination does not exist", async () => {
    userModel.findOne.mockResolvedValueOnce(null);
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({ success: false, message: "Wrong Email Or Answer" });
  });

  it("should return 200 with message that password reset successfully if email and answer combination exists", async () => {
    userModel.findOne.mockResolvedValueOnce({ _id: "1", email: "test@example.com", answer: "answer" });
    hashPassword.mockResolvedValueOnce("hashedNewPassword");
    userModel.findByIdAndUpdate.mockResolvedValueOnce({ _id: "1" });
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({ success: true, message: "Password Reset Successfully" });
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith("1", { password: "hashedNewPassword" });
  });
});
