import { registerController, loginController, forgotPasswordController, testController, updateProfileController, getOrdersController, getAllOrdersController, orderStatusController } from "./authController.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import JWT from "jsonwebtoken";

jest.mock("../models/userModel");
jest.mock("../models/orderModel");
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
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringMatching(/name/i),
    }));
  });

  it("should return error if email is missing", async () => {
    delete req.body.email;
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringMatching(/email/i),
    }));
  });

  it("should return error if password is missing", async () => {
    delete req.body.password;
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringMatching(/password/i),
    }));
  });

  it("should return error if phone is missing", async () => {
    delete req.body.phone;
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringMatching(/phone/i),
    }));
  });

  it("should return error if address is missing", async () => {
    delete req.body.address;
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringMatching(/address/i),
    }));
  });

  it("should return error if answer is missing", async () => {
    delete req.body.answer;
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringMatching(/answer/i),
    }));
  });

  it("should return error if user already exists", async () => {
    userModel.findOne.mockResolvedValueOnce({ email: "test@example.com"});
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
    }));
  });

  it("should return 500 with message of error if error occurs", async () => {
    userModel.findOne.mockRejectedValueOnce("Database Error");
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
    }));
  });

  it("should register user if all fields are valid and user does not exist", async () => {
    userModel.findOne.mockResolvedValueOnce(null);
    hashPassword.mockResolvedValueOnce("hashedPassword");
    userModel.mockReturnValueOnce({ save: jest.fn().mockResolvedValueOnce({ name: "John Doe" }) });
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
    }));
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

  it("should return 400 with message that either email or password is invalid if email is missing", async () => {
    delete req.body.email;
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
    }));
  });

  it("should return 400 with message that either email or password is invalid if password is missing", async () => {
    delete req.body.password;
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
    }));
  });

  it("should return 404 with message that email is not registered if user does not exist", async () => {
    userModel.findOne.mockResolvedValueOnce(null);
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: expect.stringMatching(/email/i),
    }));
  });

  it("should return 401 with message that password is incorrect if password does not match", async () => {
    userModel.findOne.mockResolvedValueOnce({ email: "test@example.com", password: "incorrectHashedPassword" });
    comparePassword.mockResolvedValueOnce(false);
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: expect.stringMatching(/password/i),
    }));
  });

  it("should return 500 if an error occurs", async () => {
    userModel.findOne.mockRejectedValueOnce("Database Error");
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
    }));
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
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
    }));
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
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringMatching(/email/i),
    }));
  });

  it("should return 400 with message that answer is required if answer is missing", async () => {
    delete req.body.answer;
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringMatching(/answer/i),
    }));
  });

  it("should return 400 with message that new password is required if new password is missing", async () => {
    delete req.body.newPassword;
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringMatching(/new password/i),
    }));
  });

  it("should return 500 with message of error if error occurs", async () => {
    userModel.findOne.mockRejectedValueOnce("Database Error");
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
    }));
  });

  it("should return 404 with message that email or answer is wrong if email and answer combination does not exist", async () => {
    userModel.findOne.mockResolvedValueOnce(null);
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: expect.stringMatching(/email/i),
    }));
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: expect.stringMatching(/answer/i),
    }));
  });

  it("should return 200 with message that password reset successfully if email and answer combination exists", async () => {
    userModel.findOne.mockResolvedValueOnce({ _id: "1", email: "test@example.com", answer: "answer" });
    hashPassword.mockResolvedValueOnce("hashedNewPassword");
    userModel.findByIdAndUpdate.mockResolvedValueOnce({ _id: "1" });
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
    }));
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith("1", { password: "hashedNewPassword" });
  });
});

describe("test testController", () => {
  let req, res;

  it("should return 'Protected Routes' if no error occurs", async () => {
    req = {};
    res = {
      send: jest.fn(),
    };
    testController(req, res);
    expect(res.send).toHaveBeenCalledWith("Protected Routes");
  });

  
  it("should return error if error occurs", async () => {
    const error = new Error("Error in testController");

    req = {}
    res.send = jest.fn(() => {
      throw error;
    });

    try {
      testController(req, res);
    } catch (e) {
      expect(e).toEqual(error);
      expect(res.send).toHaveBeenCalledWith({ error });
    }
  });
});

describe("test updateProfileController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        name: "John Doe New",
        email: "test@example.com",
        password: "newpassword",
        phone: "123456789",
        address: "123 New Main St",
      },
      user: {
        _id: "1",
      }
    };

    res = {
      send: jest.fn(),
      json: jest.fn(),
      status: jest.fn(() => res),
    };
  });

  it("should return error new password is less than 6 characters", async () => {
    req.body.password = "123";
    await updateProfileController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.stringMatching(/6 characters long/i),
    }));
  });

  it("should return 200 if profile is updated sucessfully", async () => {
    userModel.findById.mockResolvedValue({
      _id: "1",
      name: "John Doe",
      email: "test@example.com",
      password: "hashedPassword",
      phone: "12345678",
      address: "123 Main St",
    });

    hashPassword.mockResolvedValue("newHashedPassword");

    userModel.findByIdAndUpdate.mockResolvedValue({
      _id: "1",
      name: "John Doe New",
      password: "newHashedPassword",
      phone: "123456789",
      address: "123 New Main St",
    });

    await updateProfileController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
    }));
  });

  it("should return 200 even if all fields are empty", async () => {
    req.body = {
      _id: "1",
    };

    userModel.findById.mockResolvedValue({
      _id: "1",
      name: "John Doe",
      password: "hashedPassword",
      phone: "12345678",
      address: "123 Main St",
    });

    hashPassword.mockResolvedValue("hashedPassword");

    userModel.findByIdAndUpdate.mockResolvedValue({
      _id: "1",
      name: "John Doe",
      password: "hashedPassword",
      phone: "12345678",
      address: "123 Main St",
    });

    await updateProfileController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
    }));
  });


  it("should be able to update just one field", async () => {
    req.body = {
      _id: "1",
      name: "John Doe New",
    };

    userModel.findById.mockResolvedValue({
      _id: "1",
      name: "John Doe",
      password: "hashedPassword",
      phone: "12345678",
      address: "123 Main St",
    });

    hashPassword.mockResolvedValue("hashedPassword");

    userModel.findByIdAndUpdate.mockResolvedValue({
      _id: "1",
      name: "John Doe New",
      password: "hashedPassword",
      phone: "12345678",
      address: "123 Main St",
    });

    await updateProfileController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
    }));
  });

  it("should return 500 if server error occurs while updating profile", async () => {
    userModel.findById.mockResolvedValue({
      _id: "1",
      name: "John Doe",
      email: "test@example.com",
      password: "hashedPassword",
      phone: "12345678",
      address: "123 Main St",
    });

    hashPassword.mockResolvedValue("newHashedPassword");

    userModel.findByIdAndUpdate.mockRejectedValueOnce("Database Error");

    await updateProfileController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
    }));
  });
});

describe("test getOrdersController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: {
        _id: "1",
      },
    };
    res = {
      json: jest.fn(),
      send: jest.fn(),
      status: jest.fn(() => res),
    };

    orderModel.find.mockImplementation(() => ({
      populate: jest.fn(() => ({
        populate: jest.fn().mockResolvedValue([
          {
            _id: "1",
            products: ["1", "2"],
            payment: {},
            buyer: {_id: "1", name: "John Doe"},
            status: 'Not Processed'
          },
          {
            _id: "2",
            products: ["2", "3"],
            payment: {},
            buyer: {_id: "1", name: "John Doe"},
            status: 'Processing'
          }
        ]),
      })),
    }));
  });

  it("should return 200 with orders if no error occurs", async () => {

    await getOrdersController(req, res);

    expect(res.json).toHaveBeenCalledWith([
      {
        _id: "1",
        products: ["1", "2"],
        payment: {},
        buyer: {_id: "1", name: "John Doe"},
        status: 'Not Processed'
      },
      {
        _id: "2",
        products: ["2", "3"],
        payment: {},
        buyer: {_id: "1", name: "John Doe"},
        status: 'Processing'
      }
    ]);
  });

  it("should return 500 if error occurs", async () => {
    orderModel.find.mockImplementation(() => ({
      populate: jest.fn(() => ({
        populate: jest.fn().mockRejectedValueOnce("Database Error"),
      })),
    }));

    await getOrdersController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
    }));
  });
});

describe("test getAllOrdersController", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      json: jest.fn(),
      send: jest.fn(),
      status: jest.fn(() => res),
    };

    orderModel.find.mockImplementation(() => ({
      populate: jest.fn(() => ({
        populate: jest.fn(() => ({
          sort: jest.fn().mockResolvedValue([
            {
              _id: "1",
              products: ["1", "2"],
              payment: {},
              buyer: {_id: "1", name: "John Doe"},
              status: 'Not Processed',
              createdAt: "2025-02-09T10:30:00Z",
            },
            {
              _id: "2",
              products: ["2", "3"],
              payment: {},
              buyer: {_id: "2", name: "John Doe2"},
              status: 'Processing',
              createdAt: "2025-02-08T10:30:00Z",
            }
          ]),
        })),
      })),
    }));
  });

  it("should return 200 with orders if no error occurs", async () => {
    await getAllOrdersController(req, res);

    expect(res.json).toHaveBeenCalledWith([
      {
        _id: "1",
        products: ["1", "2"],
        payment: {},
        buyer: {_id: "1", name: "John Doe"},
        status: 'Not Processed',
        createdAt: "2025-02-09T10:30:00Z",
      },
      {
        _id: "2",
        products: ["2", "3"],
        payment: {},
        buyer: {_id: "2", name: "John Doe2"},
        status: 'Processing',
        createdAt: "2025-02-08T10:30:00Z",
      }
    ]);
  });

  it("should return 500 if error occurs", async () => {
    orderModel.find.mockImplementation(() => ({
      populate: jest.fn(() => ({
        populate: jest.fn(() => ({
          sort: jest.fn().mockRejectedValueOnce("Database Error"),
        })),
      })),
    }));

    await getAllOrdersController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
    }));
  });
});

describe("test orderStatusController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {
        orderId: "1",
      },
      body: {
        status: "Processing",
      },
    };
    res = {
      json: jest.fn(),
      send: jest.fn(),
      status: jest.fn(() => res),
    };
  });

  it("should return 200 with updated order if no error occurs", async () => {
    orderModel.findByIdAndUpdate.mockResolvedValue({
      _id: "1",
      products: ["1", "2"],
      payment: {},
      buyer: {_id: "1", name: "John Doe"},
      status: 'Processing',
    });

    await orderStatusController(req, res);

    expect(res.json).toHaveBeenCalledWith({
      _id: "1",
      products: ["1", "2"],
      payment: {},
      buyer: {_id: "1", name: "John Doe"},
      status: 'Processing',
    });
  });

  it("should return 500 if error occurs", async () => {
    orderModel.findByIdAndUpdate.mockRejectedValueOnce("Database Error");

    await orderStatusController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
    }));
  });
});