// Done By: Jamie Toh
// Tests: Admin View Products
// createProductController, deleteProductController, updateProductController

import productModel from "../models/productModel.js";
import { createProductController, deleteProductController, updateProductController } from "./productController.js";
import fs from "fs";
import slugify from "slugify";

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

describe("Admin View Products Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "log").mockImplementation(() => {});
    });

    describe("createProductController", () => {

        const mockPhoto = { data: null, contentType: null };

        it("should create a product successfully", async () => {
            slugify.mockReturnValue("test-product");
            fs.readFileSync.mockReturnValue(mockBuffer);
            productModel.mockImplementation((field) => ({
                ...field,
                photo: mockPhoto,
                save: jest.fn(),
            }));
    
            await createProductController(mockProduct, mockResponse);
            expect(slugify).toHaveBeenCalledWith(mockProduct.fields.name);
            expect(fs.readFileSync).toHaveBeenCalledWith(mockProduct.files.photo.path);
            expect(productModel).toHaveBeenCalledWith({
                ...mockProduct.fields,
                slug: "test-product",
            });
            expect(mockPhoto.data).toEqual(mockBuffer);
            expect(mockPhoto.contentType).toEqual(mockProduct.files.photo.type);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.send).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                products: expect.objectContaining({
                    ...mockProduct.fields,
                    slug: "test-product",
                    photo: {
                        data: mockBuffer,
                        contentType: "image/jpeg",
                    }
                }),
            }));
        });

        it("should throw error without photo provided", async () => {
            slugify.mockReturnValue("test-product");
            productModel.mockImplementation((field) => ({
                ...field,
                photo: mockPhoto,
                save: jest.fn(),
            }));
    
            await createProductController({
                fields: {
                    name: "Test Product",
                    description: "This is a test product",
                    price: 100,
                    category: "Test",
                    quantity: 100,
                },
                files: {},
            }, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.send).toHaveBeenCalledWith({
                error: "Photo is Required",
            });
        });
    
        it("should display an error if photo saving fails", async () => {
            slugify.mockReturnValue("test-product");
            fs.readFileSync.mockImplementation(() => { throw new Error("Error") });
            productModel.mockImplementation(() => ({
                photo: mockPhoto,
                save: jest.fn(),
            }));
    
            await createProductController(mockProduct, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.send).toHaveBeenCalledWith({
                error: "Error while saving product photo",
            });
        });

        it("should display error if product creation fails", async () => {
            slugify.mockReturnValue("test-product");
            fs.readFileSync.mockReturnValue(mockBuffer);
            productModel.mockImplementation(() => ({
                photo: mockPhoto,
                save: jest.fn().mockRejectedValue("500 Internal Server Error"),
            }));
    
            await createProductController(mockProduct, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.send).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                error: "500 Internal Server Error",
            }));
            expect(console.log).toHaveBeenCalledWith("500 Internal Server Error");
        });
    
        it("should display error if name is empty", async () => {
            const invalidProduct = {
                ...mockProduct,
                fields: { ...mockProduct.fields, name: "" },
            };
    
            await createProductController(invalidProduct, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.send).toHaveBeenCalledWith({
                error: "Name is Required",
            });
        });
    
        it("should display error if description is empty", async () => {
            const invalidProduct = {
                ...mockProduct,
                fields: { ...mockProduct.fields, description: "" },
            };
    
            await createProductController(invalidProduct, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.send).toHaveBeenCalledWith({
                error: "Description is Required",
            });
        });
    
        it("should display error if price is empty", async () => {
            const invalidProduct = {
                ...mockProduct,
                fields: { ...mockProduct.fields, price: "" },
            };
    
            await createProductController(invalidProduct, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.send).toHaveBeenCalledWith({
                error: "Price is Required",
            });
        });
    
        it("should display error if category is empty", async () => {
            const invalidProduct = {
                ...mockProduct,
                fields: { ...mockProduct.fields, category: "" },
            };
    
            await createProductController(invalidProduct, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.send).toHaveBeenCalledWith({
                error: "Category is Required",
            });
        });
    
        it("should display error if quantity is empty", async () => {
            const invalidProduct = {
                ...mockProduct,
                fields: { ...mockProduct.fields, quantity: "" },
            };
    
            await createProductController(invalidProduct, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.send).toHaveBeenCalledWith({
                error: "Quantity is Required",
            });
        });
    
        it("should display error if photo is bigger than 1mb", async () => {
            const invalidProduct = {
                ...mockProduct,
                files: {
                    photo: {
                        size: 2000000,
                    }
                }
            };
    
            await createProductController(invalidProduct, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.send).toHaveBeenCalledWith({
                error: "Photo should be less then 1mb",
            });
        });
    });

    describe("deleteProductController", () => {
        it("should delete a product successfully", async () => {
            jest.spyOn(productModel, "findByIdAndDelete").mockImplementation(() => ({
                select: jest.fn().mockReturnValue(mockProduct),
            }));

            await deleteProductController({ params: { pid: "test-product-id" } }, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.send).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
            }));
        });

        it("should display an error if deleting a product fails", async () => {
            jest.spyOn(productModel, "findByIdAndDelete").mockImplementation(() => ({
                select: jest.fn().mockRejectedValue("500 Internal Server Error"),
            }));

            await expect(deleteProductController({ params: { pid: "test-product-id" } }, mockResponse));
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.send).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                error: "500 Internal Server Error",
            }));
            expect(console.log).toHaveBeenCalledWith("500 Internal Server Error");
        });
    });

    describe("updateProductController", () => {
        // mock a product with all updated fields
        const updatedProduct = {
            fields: {
                name: "Updated Product",
                description: "This is an updated product",
                price: 200,
                category: "Updated",
                quantity: 200,
            },
            files: {
                photo: {
                    size: 400000,
                    path: "./updated.jpg",
                    type: "image/jpeg",
                },
            },
        }

        // the saved product with the updated fields
        const savedProduct = {
            ...updatedProduct.fields,
            slug: "updated-product",
            photo: {
                data: mockBuffer,
                contentType: "image/jpeg",
            },
            save: jest.fn(),
        }

        it("should update a product successfully", async () => {
            slugify.mockReturnValue("updated-product");
            fs.readFileSync.mockReturnValue(mockBuffer);
            jest.spyOn(productModel, "findByIdAndUpdate").mockReturnValue(savedProduct);
            
            // call the update product controller
            await updateProductController({ 
                params: { pid: "test-product-id" }, 
                fields: updatedProduct.fields,
                files: updatedProduct.files
            }, mockResponse);

            // check if the product was updated with the correct fields
            expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
                "test-product-id",
                { ...updatedProduct.fields, slug: "updated-product" },
                { new: true }
            );
            expect(savedProduct.photo.data).toEqual(mockBuffer);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.send).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                products: savedProduct,
            }));
        });

        it("should throw error without photo provided", async () => {
            slugify.mockReturnValue("updated-product");
            jest.spyOn(productModel, "findByIdAndUpdate").mockReturnValue(savedProduct);
            
            // call the update product controller
            await updateProductController({ 
                params: { pid: "test-product-id" }, 
                fields: updatedProduct.fields,
                files: {}
            }, mockResponse);

            // expect error to be thrown
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.send).toHaveBeenCalledWith({
                error: "Photo is Required",
            });
        });

        it("should display an error if name is empty", async () => {
            const invalidProduct = {
                ...mockProduct,
                fields: { ...mockProduct.fields, name: "" },
            };
    
            await updateProductController({ 
                params: { pid: "test-product-id" }, 
                fields: invalidProduct.fields,
                files: invalidProduct.files
            }, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.send).toHaveBeenCalledWith({
                error: "Name is Required",
            });
        });

        it("should display an error if description is empty", async () => {
            const invalidProduct = {
                ...mockProduct,
                fields: { ...mockProduct.fields, description: "" },
            };
    
            await updateProductController({ 
                params: { pid: "test-product-id" }, 
                fields: invalidProduct.fields,
                files: invalidProduct.files
            }, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.send).toHaveBeenCalledWith({
                error: "Description is Required",
            });
        });

        it("should display an error if price is empty", async () => {
            const invalidProduct = {
                ...mockProduct,
                fields: { ...mockProduct.fields, price: "" },
            };
    
            await updateProductController({ 
                params: { pid: "test-product-id" }, 
                fields: invalidProduct.fields,
                files: invalidProduct.files
            }, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.send).toHaveBeenCalledWith({
                error: "Price is Required",
            });
        });

        it("should display an error if category is empty", async () => {
            const invalidProduct = {
                ...mockProduct,
                fields: { ...mockProduct.fields, category: "" },
            };
    
            await updateProductController({ 
                params: { pid: "test-product-id" }, 
                fields: invalidProduct.fields,
                files: invalidProduct.files
            }, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.send).toHaveBeenCalledWith({
                error: "Category is Required",
            });
        });

        it("should display an error if quantity is empty", async () => {
            const invalidProduct = {
                ...mockProduct,
                fields: { ...mockProduct.fields, quantity: "" },
            };
    
            await updateProductController({ 
                params: { pid: "test-product-id" }, 
                fields: invalidProduct.fields,
                files: invalidProduct.files
            }, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.send).toHaveBeenCalledWith({
                error: "Quantity is Required",
            });
        });

        it("should display an error if photo is bigger than 1mb", async () => {
            const invalidProduct = {
                ...mockProduct,
                files: {
                    photo: {
                        size: 2000000,
                    }
                }
            };
    
            await updateProductController({ 
                params: { pid: "test-product-id" }, 
                fields: invalidProduct.fields,
                files: invalidProduct.files
            }, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.send).toHaveBeenCalledWith({
                error: "Photo should be less than 1mb",
            });
        });

        it("should display an error if updating photo fails", async () => {
            slugify.mockReturnValue("updated-product");
            fs.readFileSync.mockImplementation(() => { throw new Error("Error") });
            jest.spyOn(productModel, "findByIdAndUpdate").mockReturnValue(savedProduct);

            await updateProductController({ 
                params: { pid: "test-product-id" }, 
                fields: mockProduct.fields,
                files: mockProduct.files
            }, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.send).toHaveBeenCalledWith({
                error: "Error while updating product photo",
            });
        });
        
        it("should display an error if updating product fails", async () => {
            slugify.mockReturnValue("updated-product");
            fs.readFileSync.mockReturnValue(mockBuffer);
            jest.spyOn(productModel, "findByIdAndUpdate").mockReturnValue({
                ...savedProduct,
                save: jest.fn().mockRejectedValue("500 Internal Server Error"),
            });

            await updateProductController({ 
                params: { pid: "test-product-id" }, 
                fields: mockProduct.fields,
                files: mockProduct.files
            }, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.send).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                error: "500 Internal Server Error",
            }));
            expect(console.log).toHaveBeenCalledWith("500 Internal Server Error");
        });
    });
    
});