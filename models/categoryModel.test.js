import mongoose from "mongoose";
import Category from "./categoryModel.js";
import { MongoMemoryServer } from "mongodb-memory-server";

describe("CategoryModel", () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    await Category.init();
  });

  afterEach(async () => {
    await Category.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("should create & save the category successfully", async () => {
    const category = new Category({
      name: "Clothes",
      slug: "clothes",
    });
    const savedCategory = await category.save();
    expect(savedCategory._id).toBeDefined();
    expect(savedCategory.name).toBe(category.name);
    expect(savedCategory.slug).toBe(category.slug);
  });

  it("should not save a category that has no name", async () => {
    const invalidCategory = new Category({
      slug: "clothes",
    });
    await expect(invalidCategory.save()).rejects.toThrow(
      mongoose.Error.ValidationError
    );
  });

  it("should not save a category that has a non-unique name", async () => {
    const firstCategory = new Category({
      name: "Clothes",
      slug: "clothes",
    });
    await firstCategory.save();

    const secondCategory = new Category({
      name: "Clothes",
      slug: "clothes123",
    });
    await expect(secondCategory.save()).rejects.toThrowError(
      expect.objectContaining({
        name: "MongoServerError",
        code: 11000, // 11000 is the mongo error code for duplicate key.
      })
    );
  });

  it("should not save a category with no slug", async () => {
    const category = new Category({
      name: "Clothes",
    });
    await expect(category.save()).rejects.toThrow(
      mongoose.Error.ValidationError
    );
  });

  it("should not transform the slug of a category to lower case", async () => {
    const category = new Category({
      name: "Clothes",
      slug: "Clothes",
    });
    const savedCategory = await category.save();
    await expect(savedCategory.slug).toBe(category.slug.toLowerCase());
  });

  it("should not save a category with a slug containing a non-unique slug", async () => {
    const firstCategory = new Category({
      name: "Clothes",
      slug: "clothes",
    });

    await firstCategory.save();

    const secondCategory = new Category({
      name: "Clothes123",
      slug: "clothes",
    });
    await expect(secondCategory.save()).rejects.toThrowError(
      expect.objectContaining({
        name: "MongoServerError",
        code: 11000, // 11000 is the mongo error code for duplicate key.
      })
    );
  });
});
