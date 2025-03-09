import React from "react";
import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { CartProvider, useCart } from "../context/cart";
import "@testing-library/jest-dom/extend-expect";

jest.mock("axios");

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "", results: [] }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

describe("CartProvider and useCart Hook", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.spyOn(Storage.prototype, "getItem");
    jest.spyOn(Storage.prototype, "setItem");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("provides default values on initialization (empty cart)", () => {
    let contextValue;

    function TestComponent() {
      contextValue = useCart();
      return null;
    }

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(contextValue[0]).toEqual([]); // Cart should be empty initially
    expect(typeof contextValue[1]).toBe("function"); // setCart should be a function
  });

  it("loads cart from localStorage if available", () => {
    const storedCart = [{ _id: "1", name: "Laptop", price: 1000 }];
    localStorage.setItem("cart", JSON.stringify(storedCart));

    let contextValue;
    function TestComponent() {
      contextValue = useCart();
      return null;
    }

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(contextValue[0]).toEqual(storedCart); // Should load cart from localStorage
  });

  it("allows state updates when setCart is called", () => {
    let contextValue, setContextValue;

    function TestComponent() {
      [contextValue, setContextValue] = useCart();
      return null;
    }

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    act(() => {
      setContextValue([{ _id: "2", name: "Phone", price: 800 }]);
    });

    expect(contextValue).toEqual([{ _id: "2", name: "Phone", price: 800 }]);
  });

  it("updates localStorage when setCart is called", async () => {
    let setContextValue;

    function TestComponent() {
      [, setContextValue] = useCart();
      return null;
    }

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    act(() => {
      setContextValue([{ _id: "3", name: "Tablet", price: 500 }]);
    });

    await act(async () => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "cart",
        JSON.stringify([{ _id: "3", name: "Tablet", price: 500 }])
      );
    });
  });

  it("allows multiple components to share the same cart state", () => {
    function ComponentA() {
      const [, setCart] = useCart();
      return <button onClick={() => setCart([{ _id: "4", name: "Headphones", price: 150 }])}>Update Cart</button>;
    }

    function ComponentB() {
      const [cart] = useCart();
      return <p>{cart.length ? `Cart: ${cart[0].name}` : "Cart is empty"}</p>;
    }

    render(
      <CartProvider>
        <ComponentA />
        <ComponentB />
      </CartProvider>
    );

    expect(screen.getByText("Cart is empty")).toBeInTheDocument();

    act(() => {
      screen.getByRole("button", { name: /update cart/i }).click();
    });

    expect(screen.getByText("Cart: Headphones")).toBeInTheDocument();
  });

  it("throws an error when useCart is used outside CartProvider", () => {
    function TestComponent() {
      useCart();
      return null;
    }

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useCart must be used within a CartProvider");
  });
});
