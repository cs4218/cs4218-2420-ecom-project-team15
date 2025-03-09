import React from "react";
import { render, screen, fireEvent, act, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/cart";
import HomePage from "../pages/HomePage";
import "@testing-library/jest-dom/extend-expect";


jest.mock("axios");

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

jest.mock("../components/Layout", () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="mock-layout">{children}</div>,
}));

jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("HomePage Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    axios.get.mockImplementation((url) => {
      if (url.includes("/api/v1/category/get-category")) {
        return Promise.resolve({
          data: { success: true, category: [{ _id: "1", name: "Electronics" }] },
        });
      }

      if (url.includes("/api/v1/product/product-count")) {
        return Promise.resolve({ data: { total: 50 } });
      }

      if (url.includes("/api/v1/product/product-list/1")) {
        return Promise.resolve({
          data: {
            products: [
              { _id: "101", name: "Smartphone", price: 999, description: "Latest model", slug: "smartphone" },
              { _id: "102", name: "Laptop", price: 1500, description: "Powerful machine", slug: "laptop" },
            ],
          },
        });
      }

      return Promise.reject(new Error("Unknown API call"));
    });

    axios.post.mockImplementation((url) => {
      if (url.includes("/api/v1/product/product-filters")) {
        return Promise.resolve({
          data: { products: [{ _id: "105", name: "Tablet", price: 999, description: "Ipad" }] },
        });
      }
      return Promise.reject(new Error("Unknown API call"));
    });

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

  it("renders", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );
    });

    expect(screen.getByText("All Products")).toBeInTheDocument();
  });

  it("displays the banner image", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );
    });

    const bannerImage = screen.getByAltText("bannerimage");
    expect(bannerImage).toBeInTheDocument();
    expect(bannerImage).toHaveAttribute("src", "/images/Virtual.png");
  });

  it("fetches and displays categories", async () => {
    const mockCategories = {
      success: true,
      category: [
        { _id: "5", name: "Home Appliances" },
        { _id: "6", name: "Clothing" },
      ],
    };

    axios.get.mockImplementation((url) => {
      if (url.includes("/api/v1/category/get-category")) {
        return Promise.resolve({
          data: mockCategories,
        });
      }
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );
    });

    const categorySection = screen.getByText("Filter By Category").closest("div");

    await waitFor(() => {
      expect(within(categorySection).getByText("Home Appliances")).toBeInTheDocument();
      expect(within(categorySection).getByText("Clothing")).toBeInTheDocument();
    });
  });

  it("fetches and displays products", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/v1/product/product-list")) {
        return Promise.resolve({
          data: {
            products: [
              { _id: "101", name: "Smartphone 2025", description: "Iphone", price: 999, slug: "smartphone" },
              { _id: "102", name: "Laptop 2025", description: "Macbook", price: 1500, slug: "laptop" },
            ],
          },
        });
      }
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.findByText(/Laptop 2025/i)).resolves.toBeInTheDocument();
      expect(screen.findByText(/Smartphone 2025/i)).resolves.toBeInTheDocument();
    });
  });

  it("filters products when a category is selected", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/v1/product/product-list")) {
        return Promise.resolve({
          data: {
            products: [{ _id: "135", name: "Nintendo Switch", description: "OLED", price: 410 }],
          },
        });
      }
      if (url.includes("/api/v1/category/get-category")) {
        return Promise.resolve({
          data: { success: true, category: [{ _id: "1", name: "Electronics" }] },
        });
      }
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );
    });

    const checkbox = await screen.findByLabelText("Electronics");
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/v1/product/product-filters", {
        checked: ["1"],
        radio: [],
      });
    });

    expect(await screen.findByText(/Nintendo Switch/i)).toBeInTheDocument();
  });

  it("filters products when a price range is selected", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/v1/product/product-list")) {
        return Promise.resolve({
          data: {
            products: [{ _id: "110", name: "Toy gun", description: "Latest Nerf Gun", price: 121 }],
          },
        });
      }
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );
    });

    const radioButton = screen.getByText("$100 or more");
    fireEvent.click(radioButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/v1/product/product-filters", {
        checked: [],
        radio: [100, Infinity],
      });
    });

    expect(await screen.findByText("Toy gun")).toBeInTheDocument();
  });

  it("loads more products when clicking 'Load More' button", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/v1/product/product-list/1")) {
        return Promise.resolve({
          data: {
            products: [{ _id: "113", name: "Asus Laptop", description: "Gaming Laptop", price: 1500 }],
          },
        });
      }
      if (url.includes("/api/v1/product/product-count")) {
        return Promise.resolve({ data: { total: 3 } });
      }
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Asus Laptop")).toBeInTheDocument();
    });

    const loadMoreButton = await screen.findByText(/Loadmore/i);
    expect(loadMoreButton).toBeInTheDocument();

    axios.get.mockImplementation((url) => {
      if (url.includes("/api/v1/product/product-list/2")) {
        return Promise.resolve({
          data: {
            products: [
              { _id: "111", name: "Speaker", description: "Bluetooth Speaker", price: 500 },
              { _id: "105", name: "Tablet", description: "Ipad", price: 999 },
            ],
          },
        });
      }
      return Promise.reject(new Error("Unexpected API Call"));
    });

    fireEvent.click(loadMoreButton);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/product-list/2");
    });

    await waitFor(() => {
      expect(screen.getByText("Speaker")).toBeInTheDocument();
      expect(screen.getByText("Tablet")).toBeInTheDocument();
    });
  });

  it("adds a product to the cart and updates localStorage", async () => {
    const mockSetCart = jest.fn();
    useCart.mockReturnValue([[], mockSetCart]);

    const toastMock = jest.spyOn(require("react-hot-toast"), "success");

    const mockSetItem = jest.spyOn(Storage.prototype, "setItem");

    axios.get.mockImplementation((url) => {
      if (url.includes("/api/v1/product/product-list")) {
        return Promise.resolve({
          data: {
            products: [{ _id: "121", name: "Gun", description: "SAR 21", price: 1221, slug: "gun" }],
          },
        });
      }
      return Promise.resolve({ data: {} });
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );
    });

    const gunProduct = await screen.findByText(/Gun/i);
    expect(gunProduct).toBeInTheDocument();

    const productCard = gunProduct.closest(".card");
    expect(productCard).not.toBeNull();

    const addToCartButton = within(productCard).getByText(/Add To Cart/i);
    fireEvent.click(addToCartButton);

    expect(mockSetCart).toHaveBeenCalledWith([
      { _id: "121", name: "Gun", description: "SAR 21", price: 1221, slug: "gun" },
    ]);

    expect(mockSetItem).toHaveBeenCalledWith(
      "cart",
      JSON.stringify([{ _id: "121", name: "Gun", description: "SAR 21", price: 1221, slug: "gun" }])
    );

    expect(toastMock).toHaveBeenCalledWith("Item added to cart");

    mockSetItem.mockRestore();
  });

  it("navigates to product details page when 'More Details' button is clicked", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/v1/product/product-list")) {
        return Promise.resolve({
          data: {
            products: [
              {
                _id: "201",
                name: "Gaming Console",
                description: "Latest PlayStation",
                price: 499,
                slug: "gaming-console",
              },
            ],
          },
        });
      }
      return Promise.resolve({ data: {} });
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );
    });

    const product = await screen.findByText(/Gaming Console/i);
    expect(product).toBeInTheDocument();

    const productCard = product.closest(".card");
    expect(productCard).not.toBeNull();

    const moreDetailsButton = within(productCard).getByText(/More Details/i);
    fireEvent.click(moreDetailsButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/product/gaming-console");
    });
  });

  it("refreshes the page when 'Reset Filters' button is clicked", async () => {
    const mockReload = jest.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { reload: mockReload },
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );
    });

    const resetFiltersButton = screen.getByText(/RESET FILTERS/i);
    fireEvent.click(resetFiltersButton);

    await waitFor(() => {
      expect(mockReload).toHaveBeenCalled();
    });
  });

  it("handles API errors gracefully", async () => {
    axios.get.mockRejectedValueOnce(new Error("API Error"));

    await act(async () => {
      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );
    });

    expect(screen.getByText("All Products")).toBeInTheDocument();
  });
});
