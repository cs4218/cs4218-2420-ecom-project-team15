import React from "react";
import { render, screen, fireEvent, act, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/cart";
import HomePage from "../pages/HomePage";
import "@testing-library/jest-dom/extend-expect";
import userEvent from "@testing-library/user-event";

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
        radio: [100, "Infinity"],
      });
    });

    expect(await screen.findByText("Toy gun")).toBeInTheDocument();
  });

  it("loads more products when clicking 'Load More' button", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/v1/product/product-list/1")) {
        return Promise.resolve({
          data: {
            products: [
              { _id: "101", name: "Smartphone", price: 999, description: "Latest model", slug: "smartphone" },
              { _id: "102", name: "Laptop", price: 1500, description: "Powerful machine", slug: "laptop" },
              { _id: "103", name: "Smartphone2", price: 999, description: "Latest model", slug: "smartphone" },
              { _id: "104", name: "Asus Laptop", price: 1500, description: "Powerful machine", slug: "laptop" },
              { _id: "105", name: "Smartphone3", price: 999, description: "Latest model", slug: "smartphone" },
              { _id: "106", name: "Laptop3", price: 1500, description: "Powerful machine", slug: "laptop" },
            ],
          },
        });
      }
      if (url.includes("/api/v1/product/product-count")) {
        return Promise.resolve({ data: { total: 8 } });
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

  it("handles category API failure gracefully", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/v1/category/get-category")) {
        return Promise.reject(new Error("Failed to fetch categories"));
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

    expect(screen.getByText("All Products")).toBeInTheDocument();
  });

  it("handles product count API failure gracefully", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/v1/product/product-count")) {
        return Promise.reject(new Error("Failed to fetch product count"));
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

    expect(screen.getByText("All Products")).toBeInTheDocument();
  });
  it("fetches all products when filters are cleared", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/v1/product/product-list")) {
        return Promise.resolve({ data: { products: [] } });
      }
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );
    });

    fireEvent.click(screen.getByText(/RESET FILTERS/i));

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/product-list/1");
    });
  });

  it("calls filterProduct when category is selected", async () => {
    axios.post.mockImplementation((url) => {
      if (url.includes("/api/v1/product/product-filters")) {
        return Promise.resolve({ data: { products: [] } });
      }
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );
    });

    fireEvent.click(screen.getByLabelText(/Electronics/i));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/v1/product/product-filters", {
        checked: ["1"],
        radio: [],
      });
    });
  });

  it("loads more products when page number is increased", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/v1/product/product-list/1")) {
        return Promise.resolve({
          data: {
            products: [{ _id: "203", name: "Razer Laptop", description: "Gaming Laptop", price: 2300 }],
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

    fireEvent.click(screen.getByText(/Loadmore/i));

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/product-list/2");
      expect(screen.getByText("Razer Laptop")).toBeInTheDocument();
    });
  });

  it("removes category filter when a selected category is deselected", async () => {
    axios.post.mockResolvedValue({ data: { products: [] } });
  
    axios.get.mockImplementation((url) => {
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
  
    const electronicsCheckbox = await screen.findByLabelText("Electronics");
  
    await act(async () => {
      userEvent.click(electronicsCheckbox);
    });
  
    expect(electronicsCheckbox).toBeChecked();
  
    await act(async () => {
      userEvent.click(electronicsCheckbox);
    });
  
    expect(electronicsCheckbox).not.toBeChecked();
  });
  
  it("handles error in filterProduct function gracefully", async () => {
    const mockError = new Error("Product filter API failed");
    jest.spyOn(axios, "post").mockRejectedValueOnce(mockError);
  
    const consoleLogMock = jest.spyOn(console, "log").mockImplementation(() => {});
  
    await act(async () => {
      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );
    });
  
    const electronicsCheckbox = await screen.findByLabelText("Electronics");
    await act(async () => {
      fireEvent.click(electronicsCheckbox);
    });
  
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/v1/product/product-filters", {
        checked: ["1"],
        radio: [],
      });
    });
  
    await waitFor(() => {
      expect(consoleLogMock).toHaveBeenCalledWith(mockError);
    });
  
    consoleLogMock.mockRestore();
  });

  it("handles error in getAllProducts function gracefully", async () => {
    const mockError = new Error("Product fetch API failed");
  
    jest.spyOn(axios, "get").mockImplementation((url) => {
      if (url.includes("/api/v1/product/product-list/")) {
        return Promise.reject(mockError); 
      }
      if (url.includes("/api/v1/category/get-category")) {
        return Promise.resolve({ data: { success: true, category: [] } }); 
      }
      return Promise.reject(new Error(`Unexpected API call: ${url}`));
    });
  
    const consoleErrorMock = jest.spyOn(console, "error").mockImplementation(() => {});
  
    await act(async () => {
      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );
    });
  
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/product-list/1");
    });
  
    await waitFor(() => {
      expect(consoleErrorMock).toHaveBeenCalledWith("Error fetching products:", mockError);
    });
  
    consoleErrorMock.mockRestore();
  });
  
  
  it("does not call getAllProducts when category and price filters are selected", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/v1/category/get-category")) {
        return Promise.resolve({
          data: { success: true, category: [{ _id: "1", name: "Electronics" }] },
        });
      }
      if (url.includes("/api/v1/product/product-list")) {
        return Promise.resolve({ data: { products: [] } });
      }
      return Promise.reject(new Error("Unexpected API call"));
    });
  
    jest.spyOn(axios, "post").mockResolvedValue({ data: { products: [] } });
  
    await act(async () => {
      render(
        <MemoryRouter> 
          <HomePage />
        </MemoryRouter>
      );
    });
  
    expect(axios.get).toHaveBeenCalledWith("/api/v1/product/product-list/1");
  
    const electronicsCheckbox = await screen.findByLabelText("Electronics");
    expect(electronicsCheckbox).not.toBeChecked();
    await act(async () => {
      fireEvent.click(electronicsCheckbox);
    });
  
    expect(electronicsCheckbox).toBeChecked();
  
    const priceRadio = screen.getByText("$100 or more");
    jest.clearAllMocks();
    await act(async () => {
      fireEvent.click(priceRadio);
    });
  
    await waitFor(() => {
      expect(axios.get).not.toHaveBeenCalled();
    });
  
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/v1/product/product-filters", {
        checked: ["1"], 
        radio: [100, "Infinity"], 
      });
    });
  });
});
