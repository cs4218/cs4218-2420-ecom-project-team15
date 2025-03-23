import { MongoMemoryServer } from "mongodb-memory-server";
import categoryModel from "../../models/categoryModel";
import mongoose from "mongoose";
import {
  getAllCategoryController,
  singleCategoryController,
} from "../categoryController";

describe("getAllCategoryController", () => {
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

  it("should return an empty category list when no categories exist", async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await getAllCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "All Categories List",
      category: [],
    });
  });

  it("should return all categories when categories exist", async () => {
    // Insert test categories into DB
    await categoryModel.create([
      { name: "Electronics", slug: "electronics" },
      { name: "Books", slug: "books" },
    ]);

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await getAllCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "All Categories List",
      })
    );
    expect(res.send.mock.calls[0][0].category.length).toBe(2);
    const categoryNames = res.send.mock.calls[0][0].category.map((c) => c.name);
    expect(categoryNames).toEqual(
      expect.arrayContaining(["Electronics", "Books"])
    );
  });

  it("should handle errors gracefully when the database fails", async () => {
    // Simulate database error
    jest.spyOn(categoryModel, "find").mockImplementationOnce(() => {
      throw new Error("Database failure");
    });

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await getAllCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: expect.any(Error),
      message: "Error while getting all categories",
    });
  });
});

describe("singleCategoryController", () => {
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

  it("should return 404 when category does not exist", async () => {
    const req = { params: { slug: "non-existent" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await singleCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "No category of the given slug was found",
    });
  });

  it("should return a category when it exists", async () => {
    const category = await categoryModel.create({
      name: "Electronics",
      slug: "electronics",
    });

    const req = { params: { slug: "electronics" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await singleCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Get Single Category Successfully",
      category: expect.objectContaining({
        _id: expect.anything(),
        name: "Electronics",
        slug: "electronics",
      }),
    });
  });

  it("should handle errors gracefully when the database fails", async () => {
    jest.spyOn(categoryModel, "findOne").mockImplementationOnce(() => {
      throw new Error("Database failure");
    });

    const req = { params: { slug: "electronics" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await singleCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: expect.any(Error),
      message: "Error while getting a single Category",
    });
  });
});
