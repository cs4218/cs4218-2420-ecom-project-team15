import React from "react";
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SearchProvider } from "../context/search";
import Search from "../pages/Search";
import "@testing-library/jest-dom/extend-expect";

jest.mock("axios");

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../context/cart", () => ({
    useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
  }));

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "", results: []}, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

describe("Search Page Component", () => {
  it("renders search page without crashing", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Search />
        </MemoryRouter>
      );
    });

    expect(screen.getByText("Search Results")).toBeInTheDocument();
  });

  it("displays 'No Products Found' when there are no results", async() => {
    await act(async () => {
        render(
          <MemoryRouter>
            <Search />
          </MemoryRouter>
        );
      });

    expect(screen.getByText("No Products Found")).toBeInTheDocument();
  });


  it("displays search results when products exist", async () => {
    require("../context/search").useSearch.mockReturnValue([
      {
        keyword: "Laptop",
        results: [
          { _id: "1", name: "MacBook Pro", description: "Apple laptop", price: 1200 },
          { _id: "2", name: "Dell XPS", description: "Windows laptop", price: 900 },
        ],
      },
      jest.fn(),
    ]);

    await act(async () => {
        render(
          <MemoryRouter>
            <Search />
          </MemoryRouter>
        );
      });

    expect(screen.getByText("Found 2")).toBeInTheDocument();
    expect(screen.getByText("MacBook Pro")).toBeInTheDocument();
    expect(screen.getByText("Dell XPS")).toBeInTheDocument();
  });


  it("renders product details correctly", async () => {
    require("../context/search").useSearch.mockReturnValue([
      {
        keyword: "Phone",
        results: [
          { _id: "3", name: "iPhone 14", description: "Apple phone with great camera and screen", price: 999 },
        ],
      },
      jest.fn(),
    ]);

    await act(async () => {
        render(
          <MemoryRouter>
            <Search />
          </MemoryRouter>
        );
      });

    expect(screen.getByText("iPhone 14")).toBeInTheDocument();
    expect(screen.getByText("Apple phone with great camera...")).toBeInTheDocument(); // Description truncated
    expect(screen.getByText("$ 999")).toBeInTheDocument();
  });

  it("ensures each product has 'More Details' and 'Add To Cart' buttons", async() => {
    require("../context/search").useSearch.mockReturnValue([
      {
        keyword: "Tablet",
        results: [{ _id: "4", name: "iPad Pro", description: "Apple tablet", price: 1100 }],
      },
      jest.fn(),
    ]);

    await act(async () => {
        render(
          <MemoryRouter>
            <Search />
          </MemoryRouter>
        );
      });

    expect(screen.getByText(/More Details/i)).toBeInTheDocument();
    expect(screen.getByText(/Add To Cart/i)).toBeInTheDocument();
  });
  //as teammate enforces that images need to be present just need this
  it("renders product images with correct alt text", async() => {
    require("../context/search").useSearch.mockReturnValue([
      {
        keyword: "Watch",
        results: [{ _id: "5", name: "Apple Watch", description: "Smart wearable", price: 400 }],
      },
      jest.fn(),
    ]);

    await act(async () => {
        render(
          <MemoryRouter>
            <Search />
          </MemoryRouter>
        );
      });

    const image = screen.getByAltText("Apple Watch");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/api/v1/product/product-photo/5");
  });
});
