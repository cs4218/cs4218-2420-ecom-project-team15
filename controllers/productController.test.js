import { searchProductController, relatedProductController, productCategoryController } from "./productController";
import productModel from "../models/productModel";
import categoryModel from "../models/categoryModel";
import { beforeEach, describe } from "node:test";

jest.mock("../models/productModel");
jest.mock("../models/categoryModel");
jest.mock("fs");
jest.mock("slugify");
jest.mock("braintree", () => ({
    BraintreeGateway: jest.fn(() => ({
      clientToken: {
        generate: jest.fn(),
      },
      transaction: {
        sale: jest.fn(),
      },
    })),
    Environment: {
      Sandbox: "sandbox",
    },
  }));

describe("Search Product Controller Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const req = {
        params: {
            keyword: "Laptop"
        }
    };

    const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
    };

    test("Successfully returns products that match keyword", async () => {
        const mockProducts = [
            { _id: "1", name: "Gaming Laptop", description: "High-performance laptop" },
            { _id: "2", name: "Business Laptop", description: "Ideal for office work" },
        ];

        productModel.find.mockImplementation(() => ({
            select: jest.fn().mockResolvedValue(mockProducts)
        }));

        await searchProductController(req, res);

        expect(productModel.find).toBeCalledWith({
            $or: [
                { name: { $regex: "Laptop", $options: "i" } },
                { description: { $regex: "Laptop", $options: "i" } },
            ],
        });
        expect(res.json).toBeCalledWith(mockProducts);
    });

    test("Error while searching product", async () => {
        const mockError = new Error("Some Error");

        productModel.find.mockImplementation(() => ({
            select: jest.fn().mockRejectedValue(mockError)
        }));

        await searchProductController(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.send).toBeCalledWith({
            success: false,
            message: "Error In Search Product API",
            error: mockError
        });
    });
});

describe("Related Product Controller Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const req = {
        params: {
            pid: "1",
            cid: "2"
        }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
    };

    test("Successfully returns related products", async () => {
        const mockProducts = [
            { _id: "3", name: "Gaming Laptop", description: "High-performance laptop" },
            { _id: "4", name: "Business Laptop", description: "Ideal for office work" },
        ];

        productModel.find.mockImplementation(() => ({
            select: jest.fn().mockImplementation(() => ({
                limit: jest.fn().mockImplementation(() => ({
                    populate: jest.fn().mockResolvedValue(mockProducts)
                })),
            })),
        }));

        await relatedProductController(req, res);

        expect(productModel.find).toBeCalledWith({
            category: "2",
            _id: { $ne: "1" }
        });
        expect(res.status).toBeCalledWith(200);
        expect(res.send).toBeCalledWith({
            success: true,
            products: mockProducts
        });
    });

    test("Error while getting related products", async () => {
        const mockError = new Error("Some Error");

        productModel.find.mockImplementation(() => ({
            select: jest.fn().mockImplementation(() => ({
                limit: jest.fn().mockImplementation(() => ({
                    populate: jest.fn().mockRejectedValue(mockError)
                })),
            })),
        }));

        await relatedProductController(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.send).toBeCalledWith({
            success: false,
            message: "error while geting related product",
            error: mockError
        });
    });
});

describe("Product Category Controller Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const req = {
        params: {
            slug: "laptop"
        }
    }

    const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
    }

    test("Successfully returns products by category", async () => {
        const mockCategory = { _id: "1", name: "Laptop", slug: "laptop" };
        const mockProducts = [
            { _id: "3", name: "Gaming Laptop", description: "High-performance laptop" },
            { _id: "4", name: "Business Laptop", description: "Ideal for office work" },
        ];

        categoryModel.findOne.mockResolvedValue(mockCategory);
        productModel.find.mockImplementation(() => ({
            populate: jest.fn().mockResolvedValue(mockProducts)
        }))

        await productCategoryController(req, res);

        expect(categoryModel.findOne).toBeCalledWith({ slug: "laptop" });
        expect(productModel.find).toBeCalledWith({ category: mockCategory });
        expect(res.status).toBeCalledWith(200);
        expect(res.send).toBeCalledWith({
            success: true,
            category: mockCategory,
            products: mockProducts
        });
    });

    test("Error while getting products by category", async () => {
        const mockError = new Error("Some Error");

        categoryModel.findOne.mockRejectedValue(mockError);

        await productCategoryController(req, res);

        expect(res.status).toBeCalledWith(400);
        expect(res.send).toBeCalledWith({
            success: false,
            error: mockError,
            message: "Error While Getting products"
        });
    });
});