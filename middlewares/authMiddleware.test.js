import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { isAdmin, requireSignIn } from "./authMiddleware.js";

// Mocking JWT
jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(), // Mock jsonwebtoken verify function
}));

jest.mock("../models/userModel.js", () => ({
  findById: jest.fn(), // Mock userModel's findById function
}));

describe("Auth middleware requiresSignIn", () => {
  let req, res, next;
  beforeEach(() => {
    jest.clearAllMocks();
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
      end: jest.fn(),
    };
    next = jest.fn();
  });

  it("should call next() and set the user if the JWT token is valid.", async () => {
    const mockUser = { id: "123", name: "Test User" };
    req.headers.authorization = "Bearer valid_token";

    JWT.verify.mockReturnValueOnce(mockUser); // Mock JWT verification to return mock user

    await requireSignIn(req, res, next);

    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
  });

  it("should not call next() and not set the user if the jwt token is missimg.", async () => {
    await requireSignIn(req, res, next);

    // JWT should not even be checked
    expect(JWT.verify).not.toHaveBeenCalled();
    expect(req.user).toBeUndefined();
    expect(next).not.toHaveBeenCalled();
    // Should return 401 Unauthorized
    expect(res.status).toHaveBeenCalledWith(401);
    // Should call res.json to end the request
    expect(res.json).toHaveBeenCalled();
  });

  it("should be unauthorized and not call next if jwt verify throws an error", async () => {
    // Arrange
    // Force JWT.verify to throw an error
    JWT.verify.mockImplementation((id) => {
      throw new Error("Invalid Token");
    });
    req.headers.authorization = "Bearer valid_token";

    // Act
    await requireSignIn(req, res, next);

    // Assert
    expect(req.user).toBeUndefined();
    expect(next).not.toHaveBeenCalled();
    // Should return 401 Unauthorized
    expect(res.status).toHaveBeenCalledWith(401);
    // Should call res.json to end the request
    expect(res.json).toHaveBeenCalled(); // TODO: Have to confirm if checking for this makes the test brittle
  });
});

describe("Auth middleware isAdmin", () => {
  let req, res, next;
  beforeEach(() => {
    jest.clearAllMocks();
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
      end: jest.fn(),
    };
    next = jest.fn();
  });

  function createNewMockUser(role) {
    return {
      _id: "123",
      name: "John Doe",
      email: "johndoe@example.com",
      password: "hashedpassword123", // Simulating a hashed password
      phone: "1234567890",
      address: {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zip: "10001",
      },
      answer: "Blue",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  function createAdminMockUser() {
    return createNewMockUser(1);
  }

  function createNonAdminMockUser() {
    return createNewMockUser(0);
  }

  it("should call next() if there is an user and the user is an admin.", async () => {
    const adminUser = createAdminMockUser();

    // Simulate existence of a user
    req.user = { _id: "123" };

    userModel.findById.mockReturnValueOnce(adminUser); // Mock database to return mock user

    await isAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should not call next() if there is a user but user is not an admin.", async () => {
    const nonAdminUser = createNonAdminMockUser();

    // Simulate existence of a user
    req.user = { _id: "123" };

    userModel.findById.mockReturnValueOnce(nonAdminUser); // Mock database to return mock user

    await isAdmin(req, res, next);

    expect(next).not.toHaveBeenCalled();
    // Should return 401 Unauthorized
    expect(res.status).toHaveBeenCalledWith(401);
    // Should return error json
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized Access",
    });
  });

  it("should not call next() if an error occurs while finding the user", async () => {
    // Simulate existence of a user
    req.user = { _id: "123" };
    const error = new Error("Invalid Token");

    userModel.findById.mockImplementation(() => {
      throw error;
    });

    await isAdmin(req, res, next);

    expect(next).not.toHaveBeenCalled();
    // Should return 401 Unauthorized
    expect(res.status).toHaveBeenCalledWith(401);
    // Should return error json
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: error,
      message: "Error in admin middleware",
    });
  });

  it("should not call next() if there is no user", async () => {
    // Simulate explicit non-existence of a user
    req.user = null;

    await isAdmin(req, res, next);

    expect(next).not.toHaveBeenCalled();
    // Should return 401 Unauthorized
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
