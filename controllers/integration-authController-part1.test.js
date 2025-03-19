import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import userModel from "../models/userModel.js";
import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import { registerController, loginController, forgotPasswordController, testController} from "./authController.js";

let mongoServer;
const collectionName = "users";

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await mongoose.connection.db.dropCollection(collectionName);
  await mongoose.connection.db.createCollection(collectionName);
});

describe("registerController", () => {
  it("should register a user successfully", async () => {
    const req = {
      body: {
        name: "John Doe",
        email: "test@example.com",
        password: "password123",
        phone: "12345678",
        address: "123 Street",
        answer: "Football",
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: "User Registered Successfully",
    }));
    
    

    const user = await userModel.findOne({ email: "test@example.com" });
    expect(user).not.toBeNull();
    expect(user.name).toBe("John Doe");
    expect(user.email).toBe("test@example.com");
    expect(await comparePassword("password123", user.password)).toBe(true);
    expect(user.phone).toBe("12345678");
    expect(user.address).toBe("123 Street");
    expect(user.answer).toBe("Football");
  });

  it("should not register a user with an existing email", async () => {
    await userModel.create({
      name: "Existing User",
      email: "test@example.com",
      password: await hashPassword("password123"),
      phone: "12345678",
      address: "123 Street",
      answer: "Football",
    });

    const req = {
      body: {
        name: "John Doe",
        email: "test@example.com",
        password: "password123",
        phone: "12345678",
        address: "123 Street",
        answer: "Football",
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Already Registered please login",
    });
  });

  it("should not register a user with an empty name", async () => {
    const req = {
      body: {
        name: "",
        email: "test@example.com",
        password: "password123",
        phone: "12345678",
        address: "123 Street",
        answer: "Football",
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      message: "Name is Required",
    });
  });

  it("should not register a user with an empty email", async () => {
    const req = {
      body: {
        name: "John Doe",
        email: "",
        password: "password123",
        phone: "12345678",
        address: "123 Street",
        answer: "Football",
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      message: "Email is Required",
    });
  });

  it("should not register a user with an empty password", async () => {
    const req = {
      body: {
        name: "John Doe",
        email: "test@example.com",
        password: "",
        phone: "12345678",
        address: "123 Street",
        answer: "Football",
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      message: "Password is Required",
    });
  });

  it("should not register a user with an empty phone number", async () => {
    const req = {
      body: {
        name: "John Doe",
        email: "test@example.com",
        password: "password123",
        phone: "",
        address: "123 Street",
        answer: "Football",
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      message: "Phone no is Required",
    });
  });

  it("should not register a user with an empty address", async () => {
    const req = {
      body: {
        name: "John Doe",
        email: "test@example.com",
        password: "password123",
        phone: "12345678",
        address: "",
        answer: "Football",
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      message: "Address is Required",
    });
  });

  it("should not register a user with an empty answer", async () => {
    const req = {
      body: {
        name: "John Doe",
        email: "test@example.com",
        password: "password123",
        phone: "12345678",
        address: "123 Street",
        answer: "",
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      message: "Answer is Required",
    });
  });
});

describe("loginController", () => {
  it("should log in the user successfully if the user exists", async () => {
    const hashedPassword = await hashPassword("password123");
    await userModel.create({
      name: "John Doe",
      email: "test@example.com",
      password: hashedPassword,
      phone: "12345678",
      address: "123 Street",
      answer: "Football",
    });

    const req = {
      body: {
        email: "test@example.com",
        password: "password123",
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: "login successfully",
      token: expect.any(String),
    }));
  });

  it("should return 404 if the user does not exist", async () => {
    const req = {
      body: {
        email: "test@example.com",
        password: "password123",
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Email is not registerd",
    });
  });

  it("should return 401 for invalid password", async () => {
    const hashedPassword = await hashPassword("password123");
    await userModel.create({
      name: "John Doe",
      email: "test@example.com",
      password: hashedPassword,
      phone: "1234567890",
      address: "123 Street",
      answer: "Football",
    });

    const req = {
      body: {
        email: "test@example.com",
        password: "password1234",
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Invalid Password",
    });
  });

  it("should return 400 for empty email", async () => {
    const req = {
      body: {
        email: "",
        password: "password123",
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Invalid email or password",
    });
  });

  it("should return 400 for empty password", async () => {
    const req = {
      body: {
        email: "test@example.com",
        password: "",
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Invalid email or password",
    });
  });
});

describe("forgotPasswordController", () => {
  beforeEach(async () => {
    await userModel.create({
      name: "John Doe",
      email: "test@example.com",
      password: await hashPassword("password123"),
      phone: "12345678",
      address: "123 Street",
      answer: "Football",
    });
  });

  it("should reset the user password successfully", async () => {
    const req = {
      body: {
        email: "test@example.com",
        answer: "Football",
        newPassword: "newPassword",
      },
    };
    const res = {
      send: jest.fn(),
      status: jest.fn(() => res),
    };

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Password Reset Successfully",
    });
    const user = await userModel.findOne({ email: "test@example.com" });
    expect(await comparePassword("newPassword", user.password)).toBe(true);
  });

  it("should return 404 for incorrect answer", async () => {
    const req = {
      body: {
        email: "test@example.com",
        answer: "Tennis",
        newPassword: "newPassword",
      },
    };
    const res = {
      send: jest.fn(),
      status: jest.fn(() => res),
    };

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Wrong Email Or Answer",
    });
    const user = await userModel.findOne({ email: "test@example.com" });
    expect(await comparePassword("newPassword", user.password)).toBe(false);
  });

  it("should return 404 for incorrect email", async () => {
    const req = {
      body: {
        email: "test2@example.com",
        answer: "Football",
        newPassword: "newPassword",
      },
    };
    const res = {
      send: jest.fn(),
      status: jest.fn(() => res),
    };

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Wrong Email Or Answer",
    });
    const user = await userModel.findOne({ email: "test@example.com" });
    expect(await comparePassword("newPassword", user.password)).toBe(false);
  });

  it("should return 400 for empty email", async () => {
    const req = {
      body: {
        email: "",
        answer: "Football",
        newPassword: "newPassword",
      },
    };
    const res = {
      send: jest.fn(),
      status: jest.fn(() => res),
    };

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      message: "Email is required",
    });
    const user = await userModel.findOne({ email: "test@example.com" });
    expect(await comparePassword("newPassword", user.password)).toBe(false);
  });

  it("should return 400 for empty email", async () => {
    const req = {
      body: {
        email: "test@example.com",
        answer: "",
        newPassword: "newPassword",
      },
    };
    const res = {
      send: jest.fn(),
      status: jest.fn(() => res),
    };

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      message: "Answer is required",
    });
    const user = await userModel.findOne({ email: "test@example.com" });
    expect(await comparePassword("newPassword", user.password)).toBe(false);
  });

  it("should return 400 for empty email", async () => {
    const req = {
      body: {
        email: "test@example.com",
        answer: "Football",
        newPassword: "",
      },
    };
    const res = {
      send: jest.fn(),
      status: jest.fn(() => res),
    };

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      message: "New Password is required",
    });
    const user = await userModel.findOne({ email: "test@example.com" });
    expect(await comparePassword("newPassword", user.password)).toBe(false);
  });
});

describe("testController", () => {
  it("should return 'Protected Routes' if no error occurs", async () => {
    const req = {};
    const res = {
      send: jest.fn(),
    };
    testController(req, res);
    expect(res.send).toHaveBeenCalledWith("Protected Routes");
  });
});
