import { createCategoryController, updateCategoryController, deleteCategoryController } from "./categoryController";
import categoryModel from "../models/categoryModel";
import { beforeEach } from "node:test";

jest.mock("../models/categoryModel");
jest.mock("slugify", () => jest.fn(x => x));

describe("Create Category Controller Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const emptyReq = { body: {} };

    const req = {
        body: {
            name: "Test Category"
        }
    }

    const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
    }

    test("Name is not provided", async () => {
        await createCategoryController(emptyReq, res);

        expect(res.send).toBeCalledWith({ message: "Name is required" });
    })

    test("Category already exists", async () => {
        categoryModel.findOne.mockResolvedValue(true);

        await createCategoryController(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.send).toBeCalledWith({
            success: true,
            message: "Category Already Exists",
        });
    });

    test("Successfully creates a new category", async () => {
        categoryModel.findOne.mockResolvedValue(false);
        categoryModel.prototype.save.mockResolvedValue({ name: "Test Category", slug: "Test Category" });

        await createCategoryController(req, res);

        expect(categoryModel.prototype.save).toHaveBeenCalled();
        expect(res.status).toBeCalledWith(201);
        expect(res.send).toBeCalledWith({
            success: true,
            message: "new category created",
            category: { name: "Test Category", slug: "Test Category" },
        });
    });

    test("Error while creating a new category", async () => {
        const mockError = new Error("Some Error");
        categoryModel.findOne.mockRejectedValue(mockError);

        await createCategoryController(req, res);

        expect(res.status).toBeCalledWith(500);
        expect(res.send).toBeCalledWith({
            success: false,
            error: mockError,
            message: "Error in Category",
        });
    });
});

describe("Update Category Controller Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })

    const req = {
        body: {
            name: "Test Category"
        },
        params: {
            id: "123"
        }
    }

    const emptyReq = { body: {}, params: { id: "123" } };

    const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
    }

    test("Name is not provided", async () => {
        await updateCategoryController(emptyReq, res);

        expect(res.send).toBeCalledWith({ message: "Name is required" });
    })

    test("Successfully updates a category", async () => {
        categoryModel.findOne.mockResolvedValue(false);
        categoryModel.findByIdAndUpdate.mockResolvedValue({ name: "Test Category", slug: "Test Category" });

        await updateCategoryController(req, res);

        expect(categoryModel.findByIdAndUpdate).toBeCalledWith("123", { name: "Test Category", slug: "Test Category" }, { new: true });
        expect(res.status).toBeCalledWith(200);
        expect(res.send).toBeCalledWith({
            success: true,
            message: "Category Updated Successfully",
            category: { name: "Test Category", slug: "Test Category" },
        });
    });

    test("Category already exists", async () => {
        categoryModel.findOne.mockResolvedValue(true);

        await updateCategoryController(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.send).toBeCalledWith({
            success: false,
            message: "Category with this name already exists",
        });
    });

    test("Error while updating category", async () => {
        const mockError = new Error("Some Error");
        categoryModel.findOne.mockResolvedValue(false);
        categoryModel.findByIdAndUpdate.mockRejectedValue(mockError);

        await updateCategoryController(req, res);

        expect(res.status).toBeCalledWith(500);
        expect(res.send).toBeCalledWith({
            success: false,
            error: mockError,
            message: "Error while updating category",
        });
    });
});

describe("Delete Category Controller Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })

    const req = {
        params: {
            id: "123"
        }
    }

    const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
    }

    test("Successfully deletes a category", async () => {
        categoryModel.findByIdAndDelete.mockResolvedValue();

        await deleteCategoryController(req, res);

        expect(categoryModel.findByIdAndDelete).toBeCalledWith("123");
        expect(res.status).toBeCalledWith(200);
        expect(res.send).toBeCalledWith({
            success: true,
            message: "Category Deleted Successfully"
        });
    });

    test("Error while deleting category", async () => {
        const mockError = new Error("Some Error");
        categoryModel.findByIdAndDelete.mockRejectedValue(mockError);

        await deleteCategoryController(req, res);

        expect(res.status).toBeCalledWith(500);
        expect(res.send).toBeCalledWith({
            success: false,
            error: mockError,
            message: "error while deleting category"
        });
    });
});