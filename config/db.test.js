import mongoose from "mongoose";
import connectDB from "./db.js"; // Adjust the path accordingly

jest.mock("mongoose", () => ({
    connect: jest.fn(),
}));

describe("Database Connection", () => {
    afterEach(() => {
        delete process.env.MONGO_URL; // Clean up after each test
        jest.clearAllMocks();
    });

    it("should connect to MongoDB successfully", async () => {
        process.env.MONGO_URL = "mongodb://mocked-url:27017/test";
        mongoose.connect.mockResolvedValue({ connection: { host: "localhost" } });

        const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => { });

        await connectDB();

        expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URL);
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Connected To Mongodb Database"));

        consoleSpy.mockRestore();
    });

    it("should handle MongoDB connection error", async () => {
        const error = new Error("Connection failed");
        process.env.MONGO_URL = "mongodb://mocked-url:27017/test";
        mongoose.connect.mockRejectedValue(error);

        const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => { });

        await connectDB();

        expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URL);
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Error in Mongodb"));

        consoleSpy.mockRestore();
    });

    it("should handle null connection string", async () => {
        delete process.env.MONGO_URL; // Make mongo url null

        const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => { });

        await connectDB();

        expect(mongoose.connect).not.toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Error in Mongodb"));
        consoleSpy.mockRestore();
    });

    it("should handle empty connection string", async () => {
        process.env.MONGO_URL = "";

        const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => { });

        await connectDB();

        expect(mongoose.connect).not.toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Error in Mongodb"));
        consoleSpy.mockRestore();
    });
});