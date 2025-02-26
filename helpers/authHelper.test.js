import { hashPassword, comparePassword, SALT_ROUNDS } from "./authHelper"; // Adjust the import path
import bcrypt from "bcrypt";

jest.mock("bcrypt", () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));


describe("hashPassword", () => {
    it("hashes passwords using bcrypt's hashing algorithm", async () => {
        const mockPassword = "securePassword123";
        const mockHashedPassword = "hashedPassword";

        bcrypt.hash.mockResolvedValue(mockHashedPassword);

        const result = await hashPassword(mockPassword);

        expect(bcrypt.hash).toHaveBeenCalledWith(mockPassword, SALT_ROUNDS);
        expect(result).toBe(mockHashedPassword);
    });

    it("does not return a hashed password when an error occurs", async () => {
        const mockPassword = "securePassword123";

        bcrypt.hash.mockRejectedValue(new Error("Hashing error"));

        const result = await hashPassword(mockPassword);

        expect(bcrypt.hash).toHaveBeenCalledWith(mockPassword, SALT_ROUNDS);
        expect(result).toBeUndefined();
    });
});

describe("comparePassword", () => {
    it("uses bcrypt to compare hashed values", async () => {
        const mockPassword = "securePassword123";
        const mockHashedPassword = "hashedPassword";

        bcrypt.compare.mockResolvedValue(true);

        const result = await comparePassword(mockPassword, mockHashedPassword);

        expect(bcrypt.compare).toHaveBeenCalledWith(mockPassword, mockHashedPassword);
        expect(result).toBe(true);
    });

    it("returns false if passwords do not match", async () => {
        const mockPassword = "wrongPassword";
        const mockHashedPassword = "hashedPassword";

        bcrypt.compare.mockResolvedValue(false);

        const result = await comparePassword(mockPassword, mockHashedPassword);

        expect(bcrypt.compare).toHaveBeenCalledWith(mockPassword, mockHashedPassword);
        expect(result).toBe(false);
    });
});