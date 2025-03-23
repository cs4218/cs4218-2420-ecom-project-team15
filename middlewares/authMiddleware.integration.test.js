import { MongoMemoryServer } from "mongodb-memory-server";
import userModel from "../models/userModel";
import mongoose from "mongoose";
import { requireSignIn, isAdmin } from "./authMiddleware";
import JWT from "jsonwebtoken";



describe("requireSignIn", () => {
    let mongoServer;
    let testUser;
    let validToken;
    let invalidToken = "invalid.token.value";

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());

        // Create test user
        testUser = await userModel.create({
            name: "John Doe",
            email: "johndoe@example.com",
            password: "securepassword",
            phone: "1234567890",
            address: "123 Main St",
            answer: "test answer",
        });

        process.env.JWT_SECRET = "testsecret"; // Mock environment variable

        // Generate valid JWT token
        validToken = JWT.sign(
            { id: testUser._id, email: testUser.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        if (mongoServer) {
            await mongoServer.stop();
        }
    });

    it("should return 401 if no token is provided", async () => {
        const req = { headers: {} };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();

        await requireSignIn(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized: No token provided" });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 if an invalid token is provided", async () => {
        const req = { headers: { authorization: invalidToken } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();

        await requireSignIn(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized: Invalid token" });
        expect(next).not.toHaveBeenCalled();
    });

    it("should call next() and attach decoded user if token is valid", async () => {
        const req = { headers: { authorization: validToken } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();

        await requireSignIn(req, res, next);

        expect(req.user).toBeDefined();
        expect(req.user.id).toBe(testUser._id.toString());
        expect(req.user.email).toBe(testUser.email);
        expect(next).toHaveBeenCalled();
    });
});

describe("isAdmin", () => {
    let mongoServer;
    let adminUser;
    let nonAdminUser;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);

        // Create an admin user
        adminUser = await userModel.create({
            name: "Admin User",
            email: "admin@example.com",
            password: "securepassword",
            phone: "1234567890",
            address: "123 Admin St",
            answer: "test",
            role: 1, // Admin role
        });

        // Create a non-admin user
        nonAdminUser = await userModel.create({
            name: "Regular User",
            email: "user@example.com",
            password: "securepassword",
            phone: "0987654321",
            address: "456 User St",
            answer: "test",
            role: 0, // Regular user
        });
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    it("should allow access if user is an admin", async () => {
        const req = { user: { _id: adminUser._id } };
        const res = {};
        const next = jest.fn();

        await isAdmin(req, res, next);

        expect(next).toHaveBeenCalled(); // Ensure middleware allows access
    });

    it("should deny access if user is not an admin", async () => {
        const req = { user: { _id: nonAdminUser._id } };
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        const next = jest.fn();

        await isAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Unauthorized Access",
        });
        expect(next).not.toHaveBeenCalled(); // Ensure middleware stops execution
    });

    it("should handle errors gracefully when database fails", async () => {
        jest.spyOn(userModel, "findById").mockImplementationOnce(() => {
            throw new Error("Database failure");
        });

        const req = { user: { _id: adminUser._id } };
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        const next = jest.fn();

        await isAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message: "Error in admin middleware",
            })
        );
        expect(next).not.toHaveBeenCalled();
    });
});