import mongoose from "mongoose";
import categoryModel from "./categoryModel.js";

// jest.mock("mongoose", () => ({
//   model: jest.fn(),
//   Schema: jest.fn(),
// }));

// describe("Category Model", () => {
//   it("should create a category with a name and slug", async () => {
//     const mockCategory = {
//       name: "Technology",
//       slug: "technology",
//     };

//     const category = await new categoryModel(mockCategory).save();
//     // CategoryMock.create.mockResolvedValue(mockCategory);

//     // const createdCategory = await CategoryMock.create(mockCategory);

//     expect(category.name).toBe("Technology");
//     expect(category.slug).toBe("technology");
//   });
// });