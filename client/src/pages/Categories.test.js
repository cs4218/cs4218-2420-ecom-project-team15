import React from "react";
import { BrowserRouter } from "react-router-dom";
import useCategory from "../hooks/useCategory";
import { render, screen } from "@testing-library/react";
import Categories from "./Categories";
import Layout from "../components/Layout";
import "@testing-library/jest-dom";

jest.mock("../hooks/useCategory", () => jest.fn());

jest.mock("../components/Layout", () => ({ children }) => <div data-testid="mock-layout" >{children}</div>);


describe("Categories page", () => {
  it("should render all the categories", () => {
    const mockResult = [
      { _id: 1, slug: "clothes", name: "Clothes" },
      { _id: 2, slug: "books", name: "Books" }
    ]
    useCategory.mockReturnValue(mockResult)

    render(
      <BrowserRouter>
        <Categories />
      </BrowserRouter>
    );

    mockResult.map(cat => {
      expect(screen.queryByText(cat.name)).toBeInTheDocument()

      expect(screen.queryByText(cat.name).closest("a"))
        .toHaveProperty("href", expect.stringContaining(`/category/${cat.slug}`))
    })
  })

  it("should not render any categories if no categories are returned", async () => {
    const mockResult = []
    useCategory.mockReturnValue(mockResult)

    render(
      <BrowserRouter>
        <Categories />
      </BrowserRouter>
    );

    await expect(screen.queryAllByTestId("categories")).toEqual([])
  })
})