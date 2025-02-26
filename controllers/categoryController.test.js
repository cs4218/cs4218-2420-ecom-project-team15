import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";
import { getAllCategoryController, singleCategoryController } from "./categoryController.js";

jest.mock("../models/categoryModel.js", () => ({
  find: jest.fn(),
  findOne: jest.fn(),
}));

describe("getAllCategoryController", () => {

  let req, res;
  beforeEach(() => {
    jest.clearAllMocks();
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
      end: jest.fn(),
    };
  });

  it("should return all the categoryModels", async () => {
    const mockCategoryModels = [
      {
        name: "Clothes",
        slug: "clothes"
      },
      {
        name: "Books",
        slug: "books"
      },
    ];
    categoryModel.find.mockReturnValueOnce(mockCategoryModels);

    await getAllCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "All Categories List",
      category: mockCategoryModels
    });
  });

  it("should still return even if the result is empty", async () => {
    const mockCategoryModels = [];
    categoryModel.find.mockReturnValueOnce(mockCategoryModels);

    await getAllCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "All Categories List",
      category: mockCategoryModels
    });
  });

  it("should throw a 500 error when an error is thrown", async () => {
    const error = new Error("Random error message");
    categoryModel.find.mockImplementation((_) => {
      throw error;
    });

    await getAllCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: expect.any(Error),
      message: "Error while getting all categories"
    });
  });
});


describe("singleCategoryController", () => {

  let req, res;
  beforeEach(() => {
    jest.clearAllMocks();
    req = { headers: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
      end: jest.fn(),
    };
  });

  it("should return the categoryModel given by findOne", async () => {
    const mockCategoryModels = [
      {
        name: "Clothes",
        slug: "clothes"
      }
    ];
    req.params.slug = "clothes";
    categoryModel.findOne.mockReturnValueOnce(mockCategoryModels);

    await singleCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Get Single Category Successfully",
      category: mockCategoryModels,
    });
  });

  it("should return with 404 error when there is no category that can be found", async () => {
    req.params.slug = "clothes";
    categoryModel.findOne.mockReturnValueOnce(null);

    await singleCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "No category of the given slug was found",
    });
  });

  it("should handle invalid slug format", async () => {
    req.params.slug = "!!!invalidSlug###"; // Invalid characters
    categoryModel.findOne.mockResolvedValueOnce(null);

    await singleCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "No category of the given slug was found",
    });
  });

  it("should throw a 500 error when an error is thrown", async () => {
    const error = new Error("Random error message");
    categoryModel.findOne.mockImplementation((_) => {
      throw error;
    });

    await singleCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: expect.any(Error),
      message: "Error while getting a single Category"
    });
  });
});