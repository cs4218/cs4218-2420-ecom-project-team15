import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { requireSignIn } from "./authMiddleware.js";

// Mocking JWT
jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(), // Mock useAuth hook to return null state and a mock function for setAuth
}));

describe("Auth middleware requiresSignIn", () => {
  let req, res, next;
  beforeEach(() => {
    jest.clearAllMocks();
    req = { headers: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("should call next() if the JWT token is valid.", async () => {
    const mockUser = { id: "123", name: "Test User" };
    req.headers.authorization = "Bearer valid_token";

    JWT.verify.mockReturnValueOnce(mockUser); // Mock JWT verification to return mock user

    await requireSignIn(req, res, next);

    expect(JWT.verify).toHaveBeenCalledWith(
      "Bearer valid_token",
      process.env.JWT_SECRET
    );
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
  });

  it("should not call next() if the jwt token is missimg.", async () => {
    await requireSignIn(req, res, next);

    // JWT should not even be checked
    expect(JWT.verify).not.toHaveBeenCalled();
    // No user should be set
    expect(req.user).toBeUndefined();
    // next() should not be executed
    expect(next).not.toHaveBeenCalled();
    // Should return 401 Unauthorized
    expect(res.status).toHaveBeenCalledWith(401);
    // Should return error json
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized: No token provided",
    });
  });

  it("should be unauthorized and not call next if jwt verify throws an error", async () => {
    // Arrange
    // Force JWT.verify to throw an error
    JWT.verify.mockImplementation(() => {
      throw new Error("Invalid Token");
    });
    req.headers.authorization = "Bearer valid_token";

    // Act
    await requireSignIn(req, res, next);

    // Assert
    // JWT verify should be called
    expect(JWT.verify).toHaveBeenCalledWith(
      "Bearer valid_token",
      process.env.JWT_SECRET
    );
    // No user should be set
    expect(req.user).toBeUndefined();
    // next() should not be executed
    expect(next).not.toHaveBeenCalled();
    // Should return 401 Unauthorized
    expect(res.status).toHaveBeenCalledWith(401);
    // Should return error json for res
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized: Invalid token",
    });
  });
});
