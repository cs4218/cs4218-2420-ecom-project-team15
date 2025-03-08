import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import CartPage from "../pages/CartPage";
import { useAuth } from "../context/auth";
import { useCart } from "../context/cart";
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

jest.mock("braintree-web-drop-in-react", () => {
  return {
    __esModule: true,
    default: ({ onInstance }) => {
      setTimeout(() => {
        onInstance({
          requestPaymentMethod: jest.fn(() => Promise.resolve({ nonce: "test-nonce" })),
        });
      }, 0);

      return <div data-testid="drop-in-component">Drop-in Component</div>;
    },
  };
});

describe("CartPage Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({ data: { clientToken: "test-token" } });
    axios.post.mockResolvedValue({ data: { success: true } });
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
    global.matchMedia =
      global.matchMedia ||
      jest.fn(() => ({
        matches: false,
        addListener: jest.fn(),
        removeListener: jest.fn(),
      }));
  });

  it("renders cart page correctly with no items", async () => {
    useAuth.mockReturnValue([{ token: "mockToken", user: { name: "Koko", address: "123456 Street" } }]);
    useCart.mockReturnValue([[], jest.fn()]);

    await act(async () => {
      render(
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      );
    });

    expect(screen.getByText("Your Cart Is Empty")).toBeInTheDocument();
  });

  it("displays correct user greeting", async () => {
    useAuth.mockReturnValue([{ token: "mockToken", user: { name: "John Doe", address: "KR Street" } }]);
    useCart.mockReturnValue([[], jest.fn()]);

    await act(async () => {
      render(
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      );
    });

    expect(screen.getByText("Hello John Doe")).toBeInTheDocument();
  });

  it("displays correct guest greeting when user is not logged in", async () => {
    useAuth.mockReturnValue([null]);
    useCart.mockReturnValue([[], jest.fn()]);

    await act(async () => {
      render(
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      );
    });

    expect(screen.getByText("Hello Guest")).toBeInTheDocument();
  });

  it("displays correct number of cart items", async () => {
    useAuth.mockReturnValue([{ token: "mockToken", user: { name: "Lebron", address: "Temasek Street" } }]);
    useCart.mockReturnValue([
      [
        {
          _id: "1",
          name: "Product A",
          description: "Test description for product",
          price: 20,
        },
      ],
      jest.fn(),
    ]);

    await act(async () => {
      render(
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/1 item/i)).toBeInTheDocument();
    });
  });

  it("displays correct cart items", async () => {
    useAuth.mockReturnValue([{ token: "mockToken", user: { name: "Mary", address: "EU Street" } }]);
    useCart.mockReturnValue([
      [
        {
          _id: "2",
          name: "Product B",
          description: "Test correct descriptionsss",
          price: 100,
        },
      ],
      jest.fn(),
    ]);

    await act(async () => {
      render(
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/Product B/i)).toBeInTheDocument();
      expect(screen.getByText(/Test correct descriptionsss/i)).toBeInTheDocument();
      expect(screen.getByText(/Total : \$100\.00/i)).toBeInTheDocument();
    });
  });

  it("calculates total price correctly", async () => {
    useAuth.mockReturnValue([{ token: "mockToken", user: { name: "Johnny", address: "Tembu Street" } }]);
    useCart.mockReturnValue([
      [
        { _id: "3", name: "Shoes", description: "Marathon shoes", price: 100.2 },
        { _id: "4", name: "Book", description: "Knowledge is expensive", price: 50 },
      ],
      jest.fn(),
    ]);

    await act(async () => {
      render(
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      );
    });

    expect(screen.getByText(/Total : \$150\.20/i)).toBeInTheDocument();
  });

  it("removes item from cart when there is only 1 item", async () => {
    const setCart = jest.fn();
    const mockSetItem = jest.spyOn(localStorage.__proto__, "setItem");

    useAuth.mockReturnValue([{ token: "mockToken", user: { name: "Bobby", address: "Pasir Ris Street" } }]);
    useCart.mockReturnValue([
      [{ _id: "5", name: "Lego F1", description: "2024 Ferrari Technic Lego", price: 350 }],
      setCart,
    ]);

    await act(async () => {
      render(
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      );
    });

    fireEvent.click(screen.getByText("Remove"));

    expect(setCart).toHaveBeenCalledWith([]);
    expect(mockSetItem).toHaveBeenCalledWith("cart", JSON.stringify([]));

    mockSetItem.mockRestore();
  });

  it("removes the correct item when multiple items exist", async () => {
    const setCart = jest.fn();
    const mockSetItem = jest.spyOn(localStorage.__proto__, "setItem").mockImplementation(() => {});

    useAuth.mockReturnValue([{ token: "mockToken", user: { name: "Bobby", address: "Sheares Street" } }]);

    let cartItems = [
      { _id: "9", name: "Lego Ferrari", description: "2024 Ferrari Technic Lego", price: 350 },
      { _id: "10", name: "Lego Porsche", description: "911 GT3 RS Lego", price: 300 }, // remove
      { _id: "11", name: "Lego Bugatti", description: "Chiron Technic Lego", price: 400 },
    ];

    useCart.mockReturnValue([cartItems, setCart]);

    await act(async () => {
      render(
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      );
    });

    expect(screen.getByText("Lego Ferrari")).toBeInTheDocument();
    expect(screen.getByText("Lego Porsche")).toBeInTheDocument();
    expect(screen.getByText("Lego Bugatti")).toBeInTheDocument();

    const removeButtons = screen.getAllByRole("button", { name: /Remove/i });
    fireEvent.click(removeButtons[1]);

    await waitFor(() => {
      expect(setCart).toHaveBeenCalledWith([
        { _id: "9", name: "Lego Ferrari", description: "2024 Ferrari Technic Lego", price: 350 },
        { _id: "11", name: "Lego Bugatti", description: "Chiron Technic Lego", price: 400 },
      ]);
    });

    await waitFor(() => {
      expect(mockSetItem).toHaveBeenCalledWith(
        "cart",
        JSON.stringify([
          { _id: "9", name: "Lego Ferrari", description: "2024 Ferrari Technic Lego", price: 350 },
          { _id: "11", name: "Lego Bugatti", description: "Chiron Technic Lego", price: 400 },
        ])
      );
    });

    cartItems = cartItems.filter((item) => item._id !== "10");
    useCart.mockReturnValue([cartItems, setCart]);

    await waitFor(() => {
      expect(screen.queryByText("Lego Porsche")).not.toBeInTheDocument();
      expect(screen.getByText("Lego Ferrari")).toBeInTheDocument();
      expect(screen.getByText("Lego Bugatti")).toBeInTheDocument();
    });

    mockSetItem.mockRestore();
  });

  it("disables payment button when no clientToken", async () => {
    useAuth.mockReturnValue([null]);
    useCart.mockReturnValue([
      [{ _id: "6", name: "Mouse", description: "Logitech pro gaming mouse", price: 200 }],
      jest.fn(),
    ]);

    await act(async () => {
      render(
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      );
    });

    expect(screen.queryByText(/Make Payment/i)).not.toBeInTheDocument();
  });

  it("disables payment button when have clientToken but no address", async () => {
    useAuth.mockReturnValue([{ token: "mockToken", user: { name: "Bruno" } }]);
    useCart.mockReturnValue([
      [{ _id: "6", name: "Mouse", description: "Logitech pro gaming mouse", price: 200 }],
      jest.fn(),
    ]);

    await act(async () => {
      render(
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/Make Payment/i)).toBeInTheDocument();
      expect(screen.getByText(/Make Payment/i)).toBeDisabled();
    });
  });

  it("enables payment button when have clientToken and address", async () => {
    useAuth.mockReturnValue([{ token: "mockToken", user: { name: "Austin", address: "George Street" } }]);
    useCart.mockReturnValue([[{ _id: "7", name: "Phone", description: "Foldable Phone", price: 2100 }], jest.fn()]);

    await act(async () => {
      render(
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/Make Payment/i)).toBeInTheDocument();
      expect(screen.getByText(/Make Payment/i)).not.toBeDisabled();
    });
  });

  it("processes payment successfully", async () => {
    useAuth.mockReturnValue([{ token: "mockToken", user: { name: "John Doe", address: "123 Street" } }]);
    useCart.mockReturnValue([[{ _id: "8", name: "Cable", description: "Cable Desc", price: 20 }], jest.fn()]);

    axios.post.mockResolvedValue({ data: { success: true } });

    const mockRemoveItem = jest.spyOn(localStorage.__proto__, "removeItem").mockImplementation(() => {});

    await act(async () => {
      render(
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      );
    });

    const paymentButton = await screen.findByText(/Make Payment/i);
    await waitFor(() => {
      expect(paymentButton).toBeInTheDocument();
      expect(paymentButton).not.toBeDisabled();
    });

    fireEvent.click(paymentButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/v1/product/braintree/payment", {
        nonce: "test-nonce",
        cart: [{ _id: "8", name: "Cable", description: "Cable Desc", price: 20 }],
      });
    });

    await waitFor(() => {
      expect(mockRemoveItem).toHaveBeenCalledWith("cart");
    });

    mockRemoveItem.mockRestore();
  });

  it("handles payment failure gracefully", async () => {
    useAuth.mockReturnValue([{ token: "mockToken", user: { name: "BOO", address: "1233 Blk 2" } }]);
    useCart.mockReturnValue([[{ _id: "8", name: "Case", description: "Ipad Case", price: 33.5 }], jest.fn()]);

    axios.post.mockRejectedValue(new Error("Payment Error"));

    const mockRemoveItem = jest.spyOn(localStorage.__proto__, "removeItem").mockImplementation(() => {});

    await act(async () => {
      render(
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      );
    });

    const paymentButton = await screen.findByText("Make Payment");
    await waitFor(() => {
      expect(paymentButton).not.toBeDisabled();
    });

    fireEvent.click(paymentButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
      expect(mockRemoveItem).not.toHaveBeenCalled();
    });

    mockRemoveItem.mockRestore();
  });

  it("displays update address button when signed in", async () => {
    useAuth.mockReturnValue([{ token: "mockToken", user: { name: "Johnny D", address: "Tamp Street" } }]);
    useCart.mockReturnValue([
      [{ _id: "9", name: "Ring", description: "Diamond Ring size 8", price: 12000 }],
      jest.fn(),
    ]);

    await act(async () => {
      render(
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      );
    });

    expect(screen.getByText("Update Address")).toBeInTheDocument();
  });

  it("does not displays update address button when not signed in", async () => {
    useAuth.mockReturnValue([null]);
    useCart.mockReturnValue([[{ _id: "12", name: "Light", description: "Ikea Light", price: 128 }], jest.fn()]);

    await act(async () => {
      render(
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      );
    });

    expect(screen.queryByText("Update Address")).not.toBeInTheDocument();
  });
});
