// Done By: Jamie Toh
// Tests: Products Controller Part A
// getProductController, getSingleProductController, productPhotoController, productFiltersController, productCountController, productListController

import productModel from "../models/productModel.js";
import { getProductController, getSingleProductController, productPhotoController, productFiltersController, productCountController, productListController } from "./productController.js";
import fs from "fs";

jest.mock("../models/productModel.js");
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

// common mock data used in multiple tests
const mockBuffer = Buffer.from("mockPhotoData");
const mockResponse = {
    set: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
};
const mockProduct = {
    fields: {
        name: "Test Product",
        description: "This is a test product",
        price: 100,
        category: "Test",
        quantity: 100,
    },
    files: {
        photo: {
            size: 500000,
            path: "./test.jpg",
            type: "image/jpeg",
        },
    },
};

const mockProductList = [ {
    fields: {
        name: "Test Product 1",
        description: "This is a test product 1",
        price: 100,
        category: "Filter",
        quantity: 100,
    },
    files: {
        photo: {
            size: 500000,
            path: "./test1.jpg",
            type: "image/jpeg",
        },
    },
}, {
    fields: {
        name: "Test Product 2",
        description: "This is a test product 2",
        price: 200,
        category: "Test",
        quantity: 200,
    },
    files: {
        photo: {
            size: 400000,
            path: "./test2.jpg",
            type: "image/jpeg",
        },
    },
    
}, {
    fields: {
        name: "Test Product 3",
        description: "This is a test product 3",
        price: 500,
        category: "Test",
        quantity: 500,
    },
    files: {
        photo: {
            size: 300000,
            path: "./test3.jpg",
            type: "image/jpeg",
        },
    },
}];

describe("Product Controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getProductController", () => {
        it("should get all products successfully", async () => {
            jest.spyOn(productModel, "find").mockImplementation(() => ({
                select: jest.fn().mockReturnThis(),
                populate: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue(mockProductList),
            }));

            await getProductController({}, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.send).toHaveBeenCalledWith({
                success: true,
                countTotal: mockProductList.length,
                message: "All Products",
                products: mockProductList,
            });
        });

        it("should display an error if getting all products fails", async () => {
            jest.spyOn(productModel, "find").mockImplementation(() => ({
                select: jest.fn().mockReturnThis(),
                populate: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                sort: jest.fn().mockRejectedValue(new Error("Cannot get products")),
            }));

            await expect(getProductController({}, mockResponse));
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.send).toHaveBeenCalledWith({
                success: false,
                message: "Error in getting products",
                error: "Cannot get products",
            });
        });
    });

    describe("getSingleProductController", () => {
        it("should get a single product successfully", async () => {
            jest.spyOn(productModel, "findOne").mockImplementation(() => ({
                select: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(mockProduct),
            }));

            await getSingleProductController({ params: { slug: "test-product" } }, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.send).toHaveBeenCalledWith({
                success: true,
                message: "Single Product Fetched",
                product: mockProduct,
            });
        });

        it("should display an error if getting a single product fails", async () => {
            jest.spyOn(productModel, "findOne").mockImplementation(() => ({
                select: jest.fn().mockReturnThis(),
                populate: jest.fn().mockRejectedValue("Cannot get product"),
            }));

            await expect(getSingleProductController({ params: { slug: "test-product" } }, mockResponse));
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.send).toHaveBeenCalledWith({
                success: false,
                message: "Error while getting single product",
                error: "Cannot get product",
            });
        });
    });

    describe("productPhotoController", () => {
        const mockProductPhoto = {
            photo: {
                data: mockBuffer,
                contentType: "image/jpeg",
            },
        };

        it("should get photo successfully", async () => {
            fs.readFileSync.mockReturnValue(mockBuffer);
            jest.spyOn(productModel, "findById").mockImplementation(() => ({
                select: jest.fn().mockReturnValue(mockProductPhoto),
            }));

            await productPhotoController({ params: { pid: "test-product-id" } }, mockResponse);
            expect(mockResponse.set).toHaveBeenCalledWith("Content-type", mockProductPhoto.photo.contentType);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.send).toHaveBeenCalledWith(mockBuffer);
        });

        it("should return 404 error if there is no photo", async () => {
            fs.readFileSync.mockReturnValue(mockBuffer);
            jest.spyOn(productModel, "findById").mockImplementation(() => ({
                select: jest.fn().mockReturnValue({}),
            }));

            await productPhotoController({ params: { pid: "test-product-id" } }, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.send).toHaveBeenCalledWith({
                error: "No photo found",
            });
        });

        it("should display an error if getting photo fails", async () => {
            fs.readFileSync.mockReturnValue(mockBuffer);
            jest.spyOn(productModel, "findById").mockImplementation(() => ({
                select: jest.fn().mockRejectedValue("Cannot get photo"),
            }));

            await expect(productPhotoController({ params: { pid: "test-product-id" } }, mockResponse));
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.send).toHaveBeenCalledWith({
                success: false,
                message: "Error while getting photo",
                error: "Cannot get photo",
            });
        });
    });

    describe("productFiltersController", () => {
        const mockFilters = {
            body: {
                checked: ["Filter"],
                radio: [100, 200],
            }
        };

        it("should filter products successfully with category and price filters", async () => {
            jest.spyOn(productModel, "find").mockResolvedValue(mockProductList);
            await productFiltersController(mockFilters, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.send).toHaveBeenCalledWith({
                success: true,
                products: mockProductList,
            });
        });

        it("should filter products successfully with only the category filter applied", async () => {
            jest.spyOn(productModel, "find").mockResolvedValue(mockProductList);
            await productFiltersController({ body: { checked: ["Filter"], radio: [] } }, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.send).toHaveBeenCalledWith({
                success: true,
                products: mockProductList,
            });
        });

        it("should filter products successfully with only the radio filter applied", async () => {
            jest.spyOn(productModel, "find").mockResolvedValue(mockProductList);
            await productFiltersController({ body: { checked: [], radio: [100] } }, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.send).toHaveBeenCalledWith({
                success: true,
                products: mockProductList,
            });
        });

        it("should display an error if filtering products fails", async () => {
            jest.spyOn(productModel, "find").mockRejectedValue("Cannot filter products");
            await expect(productFiltersController(mockFilters, mockResponse));
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.send).toHaveBeenCalledWith({
                success: false,
                message: "Error while filtering products",
                error: "Cannot filter products",
            });
        });
    });

    describe("productCountController", () => {
        it("should get the total number of products successfully", async () => {
            jest.spyOn(productModel, "find").mockImplementation(() => ({
                estimatedDocumentCount: jest.fn().mockResolvedValue(mockProductList.length),
            }));
            await expect(productCountController({}, mockResponse));
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.send).toHaveBeenCalledWith({
                success: true,
                total: mockProductList.length,
            });
        });

        it("should display an error if getting the total number of products fails", async () => {
            jest.spyOn(productModel, "find").mockImplementation(() => ({
                estimatedDocumentCount: jest.fn().mockRejectedValue("Cannot get product count"),
            }));

            await expect(productCountController({}, mockResponse));
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.send).toHaveBeenCalledWith({
                success: false,
                message: "Error in product count",
                error: "Cannot get product count",
            });
        });
    });

    describe("productListController", () => {
        it("should list all products successfully", async () => {
            jest.spyOn(productModel, "find").mockImplementation(() => ({
                select: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue(mockProductList),
            }));

            await productListController({ params: { page: 1 } }, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.send).toHaveBeenCalledWith({
                success: true,
                products: mockProductList,
            });
        });

        it("should get products with default page number when page is not specified", async () => {
            const mockSkip = jest.fn().mockReturnThis();
            const mockLimit = jest.fn().mockReturnThis();
            
            jest.spyOn(productModel, "find").mockReturnValue({
                select: jest.fn().mockReturnThis(),
                skip: mockSkip,
                limit: mockLimit,
                sort: jest.fn().mockResolvedValue(mockProductList),
            });

            await productListController({ params: {} }, mockResponse);
            expect(mockSkip).toHaveBeenCalledWith(0);
            expect(mockLimit).toHaveBeenCalledWith(6);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.send).toHaveBeenCalledWith({
                success: true,
                products: mockProductList,
            });
        });

        it("should display an error if listing products fails", async () => {
            jest.spyOn(productModel, "find").mockImplementation(() => ({
                select: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                sort: jest.fn().mockRejectedValue("Cannot list products"),
            }));

            await expect(productListController({ params: { page: 1 } }, mockResponse));
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.send).toHaveBeenCalledWith({
                success: false,
                message: "error in per page ctrl",
                error: "Cannot list products",
            });
        });
    });
});