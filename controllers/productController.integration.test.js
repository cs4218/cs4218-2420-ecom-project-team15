import { MongoMemoryServer } from "mongodb-memory-server";
import productModel from "../models/productModel";
import categoryModel from "../models/categoryModel";
import mongoose from "mongoose";
import { productCategoryController, relatedProductController, searchProductController } from "./productController";

describe("ProductCategoryController Integration Tests", () => {
    const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
    }

    let mongoServer;
    let testCategory;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await categoryModel.deleteMany({});
        await productModel.deleteMany({});

        testCategory = await categoryModel.create({ name: "Electronics", slug: "electronics" });

        await productModel.insertMany([
            {
                name: "Laptop",
                slug: "laptop",
                description: "A high-performance laptop",
                price: 1200,
                category: testCategory._id,
                quantity: 10,
                shipping: true,
                photo: {
                    data: Buffer.from("photo data")
                }
            },
            {
                name: "Smartphone",
                slug: "smartphone",
                description: "A latest-gen smartphone",
                price: 800,
                category: testCategory._id,
                quantity: 15,
                shipping: false,
                photo: {
                    data: Buffer.from("photo data")
                }
            }
        ]);
    });

    test("should return category and associated products", async () => {
        const req = {
            params: { slug: "electronics" }
        };

        await productCategoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                category: expect.objectContaining({ name: "Electronics", slug: "electronics" }),
                products: expect.arrayContaining([
                    expect.objectContaining({ name: "Laptop" }),
                    expect.objectContaining({ name: "Smartphone" })
                ])
            })
        );
    });
});

describe("SearchProductController Integration Tests", () => {
    const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
        json: jest.fn()
    }

    let mongoServer;
    let testCategory;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await categoryModel.deleteMany({});
        await productModel.deleteMany({});

        testCategory = await categoryModel.create({ name: "Electronics", slug: "electronics" });

        await productModel.insertMany([
            {
                name: "Laptop",
                slug: "laptop",
                description: "A high-performance laptop",
                price: 1200,
                category: testCategory._id,
                quantity: 10,
                shipping: true,
                photo: {
                    data: Buffer.from("photo data")
                }
            },
            {
                name: "Smartphone",
                slug: "smartphone",
                description: "A latest-gen smartphone",
                price: 800,
                category: testCategory._id,
                quantity: 15,
                shipping: false,
                photo: {
                    data: Buffer.from("photo data")
                }
            }
        ]);
    });

    test("should return matching products for a keyword", async () => {
        const req = { params: { keyword: "laptop" } };

        await searchProductController(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({ name: "Laptop", description: "A high-performance laptop" })
            ])
        );
    });

    test("should return matching products by description", async () => {
        const req = { params: { keyword: "smartphone" } };

        await searchProductController(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({ name: "Smartphone", description: "A latest-gen smartphone" })
            ])
        );
    });

    test("should return an empty array when no products match", async () => {
        const req = { params: { keyword: "nonexistent" } };

        await searchProductController(req, res);

        expect(res.json).toHaveBeenCalledWith([]);
    });
});

describe("RelatedProductController Integration Tests", () => {
    const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
    }

    let mongoServer;
    let testCategory;
    let testProducts;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await categoryModel.deleteMany({});
        await productModel.deleteMany({});

        testCategory = await categoryModel.create({ name: "Electronics", slug: "electronics" });

        testProducts = await productModel.insertMany([
            {
                name: "Laptop",
                slug: "laptop",
                description: "A high-performance laptop",
                price: 1200,
                category: testCategory._id,
                quantity: 10,
                shipping: true,
                photo: {
                    data: Buffer.from("photo data")
                }
            },
            {
                name: "Smartphone",
                slug: "smartphone",
                description: "A latest-gen smartphone",
                price: 800,
                category: testCategory._id,
                quantity: 15,
                shipping: false,
                photo: {
                    data: Buffer.from("photo data")
                }
            }
        ]);
    });

    test("should return related products within the same category", async () => {
        const req = { params: { pid: testProducts[0]._id.toString(), cid: testCategory._id.toString() } };

        await relatedProductController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                products: expect.arrayContaining([
                    expect.objectContaining({ name: "Smartphone" })
                ])
            })
        );
    });

    test("should return an empty array if no related products exist", async () => {
        const newCategory = await categoryModel.create({ name: "Appliances", slug: "appliances" });
        const req = { params: { pid: testProducts[0]._id.toString(), cid: newCategory._id.toString() } };

        await relatedProductController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                products: []
            })
        );
    });
});
