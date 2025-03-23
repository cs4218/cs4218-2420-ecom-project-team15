import React from "react";
import { render, screen, act, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SearchProvider } from "../context/search";
import Search from "../pages/Search";
import "@testing-library/jest-dom/extend-expect";
import { useSearch } from "../context/search";

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

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(), // Mock useNavigate here
}));

describe("Search Page Component", () => {
  beforeEach(() => {
    global.matchMedia =
      global.matchMedia ||
      function () {
        return {
          matches: false,
          addListener: jest.fn(),
          removeListener: jest.fn(),
        };
      };
  });
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

  it("adds an item to the cart when 'Add To Cart' button is clicked", async () => {
    require("../context/search").useSearch.mockReturnValue([
      {
        keyword: "Laptop",
        results: [
          { _id: "1", name: "MacBook Pro", description: "Apple laptop", price: 1200 },
        ],
      },
      jest.fn(),
    ]);

    const setCartMock = jest.fn(); // Mock the setCart function

    require("../context/cart").useCart.mockReturnValue([[], setCartMock]);

    await act(async () => {
      render(
        <MemoryRouter>
          <Search />
        </MemoryRouter>
      );
    });

    // Find the 'Add To Cart' button and simulate a click
    const addToCartButton = screen.getByText("Add To Cart");
    fireEvent.click(addToCartButton);

    // Verify that the setCart function was called with the correct product
    await waitFor(() => {
      expect(setCartMock).toHaveBeenCalledWith([
        { _id: "1", name: "MacBook Pro", description: "Apple laptop", price: 1200 },
      ]);
    });
  });

  it("navigates to the product details page when 'More Details' button is clicked", async () => {
    const navigateMock = jest.fn();
    require("react-router-dom").useNavigate.mockImplementation(() => navigateMock);

    // Mock search data for the test
    useSearch.mockReturnValue([
      {
        keyword: "Phone",
        results: [
          { _id: "2", name: "iPhone 14", description: "Apple phone", price: 999, slug: "iphone-14" },
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

    // Simulate a click on the 'More Details' button
    const moreDetailsButton = screen.getByText("More Details");
    fireEvent.click(moreDetailsButton);

    // Wait for navigation to be called and verify it's with the correct path
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/product/iphone-14");
    });
  });
});
