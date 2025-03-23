import { MongoMemoryServer } from "mongodb-memory-server";
import categoryModel from "../models/categoryModel";
import mongoose from "mongoose";
import { createCategoryController, deleteCategoryController, updateCategoryController } from "./categoryController";

describe("CreateCategoryController Integration Tests", () => {
    const req = {
        body: {
            name: "Test Category"
        }
    }

    const emptyReq = { body: {} };

    const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
    }

    let mongoServer;

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
    });

    test("should create a new category successfully", async () => {
        await createCategoryController(req, res);

        const createdCategory = await categoryModel.findOne({ name: "Test Category" });
        expect(createdCategory).not.toBeNull();
        expect(createdCategory.name).toBe("Test Category");
    });

    test("should not create a category without a name", async () => {
        await createCategoryController(emptyReq, res);

        const createdCategory = await categoryModel.findOne({ name: "Test Category" });
        expect(createdCategory).toBeNull();
    });

    test("should not create a duplicate category - exact match", async () => {
        await createCategoryController(req, res);
        await createCategoryController(req, res);

        const duplicateCategory = await categoryModel.find({ name: "Test Category" });
        expect(duplicateCategory).toHaveLength(1);
    });

    test("should not create a duplicate category - case difference", async () => {
        await createCategoryController(req, res);
        req.body.name = "test category";
        await createCategoryController(req, res);

        const duplicateCategory = await categoryModel.find({ 
            name: { $regex: new RegExp(`^test category$`, 'i') } 
        });
        expect(duplicateCategory).toHaveLength(1);
    });

    test("should not create a duplicate category - leading or trailing whitespace difference", async () => {
        req.body.name = " test category  ";
        await createCategoryController(req, res);
        req.body.name = "Test Category";
        await createCategoryController(req, res);

        const duplicateCategory = await categoryModel.find({ 
            name: { $regex: new RegExp(`^test category$`, 'i') } 
        });        
        expect(duplicateCategory).toHaveLength(1);
    });
});

describe("UpdateCategoryController Integration Tests", () => {
    let req;

    const emptyReq = { body: {}, params: { id: new mongoose.Types.ObjectId(123) } };

    const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
    }

    let mongoServer;

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
        const oldCategory = await categoryModel.create({ name: "Old Test Category", slug: "old-test-category" });

        req = {
            body: {
                name: "New Test Category"
            },
            params: {
                id: oldCategory._id
            }
        }
    });

    test("should update category successfully", async () => {
        await updateCategoryController(req, res);

        const oldCategory = await categoryModel.findOne({ name: "Old Test Category" });
        expect(oldCategory).toBeNull();
        const newCategory = await categoryModel.findOne({ name: "New Test Category" });
        expect(newCategory).not.toBeNull();
        expect(newCategory.name).toBe("New Test Category");
    });

    test("should not update a category without a name", async () => {
        await updateCategoryController(emptyReq, res);

        const oldCategory = await categoryModel.findOne({ name: "Old Test Category" });
        expect(oldCategory).not.toBeNull();
        expect(oldCategory.name).toBe("Old Test Category");
        const newCategory = await categoryModel.findOne({ name: "New Test Category" });
        expect(newCategory).toBeNull();
    });

    test("should not update to a duplicate category - exact match", async () => {
        await categoryModel.create({ name: "New Test Category", slug: "new-test-category" });
       
        await updateCategoryController(req, res);

        const oldCategory = await categoryModel.findOne({ name: "Old Test Category" });
        expect(oldCategory).not.toBeNull();
        const duplicateCategory = await categoryModel.find({ name: "New Test Category" });
        expect(duplicateCategory).toHaveLength(1);
    });

    test("should not update to a duplicate category - case difference", async () => {
        await categoryModel.create({ name: "new test category", slug: "new-test-category" });
       
        await updateCategoryController(req, res);

        const oldCategory = await categoryModel.findOne({ name: "Old Test Category" });
        expect(oldCategory).not.toBeNull();
        const duplicateCategory = await categoryModel.find({ name: "new test category" });
        expect(duplicateCategory).toHaveLength(1);
    });

    test("should not update to a duplicate category - leading or trailing whitespace difference", async () => {
        await categoryModel.create({ name: "new test category", slug: "new-test-category" });
        
        req.body.name = " new test category  ";
        await updateCategoryController(req, res);

        const oldCategory = await categoryModel.findOne({ name: "Old Test Category" });
        expect(oldCategory).not.toBeNull();
        const duplicateCategory = await categoryModel.find({ name: "new test category" });
        expect(duplicateCategory).toHaveLength(1);
    });
});

describe("DeleteCategoryController Integration Tests", () => {
    let req;

    const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
    }

    let mongoServer;

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
        const testCategory = await categoryModel.create({ name: "Test Category", slug: "test-category" });

        req = {
            params: {
                id: testCategory._id
            }
        }
    });

    test("should delete category successfully", async () => {
        await deleteCategoryController(req, res);

        const oldCategory = await categoryModel.findOne({ name: "Test Category" });
        expect(oldCategory).toBeNull();
    });
});
