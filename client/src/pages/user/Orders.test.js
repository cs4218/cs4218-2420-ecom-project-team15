import React from "react";
import { render, act, fireEvent, waitFor, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/auth";
import Orders from "../../pages/user/Orders";
import "@testing-library/jest-dom/extend-expect";


// Mock axios.post
jest.mock("axios");

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

beforeEach(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  console.log.mockRestore();
  console.error.mockRestore();
});

describe("Orders Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not have any orders", async () => {
    useAuth.mockReturnValue([{ token: "mockedToken" }]);

    axios.get.mockResolvedValue({ data: [] }); // Mock empty orders

    await act(async () => {
      render(
        <MemoryRouter>
          <Orders />
        </MemoryRouter>
      );
    });

    expect(screen.getByText("All Orders")).toBeInTheDocument();
  });

  it("fetches and displays single order", async () => {
    useAuth.mockReturnValue([{ token: "mockedToken" }]);

    const mockOrders = [
      {
        _id: "1",
        status: "Processing",
        buyer: { name: "John Doe" },
        createAt: new Date().toISOString(),
        payment: { success: true },
        products: [{ _id: "p1", name: "Product A", description: "Short desc", price: 100 }],
      },
    ];

    axios.get.mockResolvedValue({ data: mockOrders });

    await act(async () => {
      render(
        <MemoryRouter>
          <Orders />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Processing")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Product A")).toBeInTheDocument();
      expect(screen.getByText("Price : 100")).toBeInTheDocument();
    });
  });

  it("renders multiple orders correctly", async () => {
    useAuth.mockReturnValue([{ token: "mockedToken" }]);

    const mockOrders = [
      {
        _id: "1",
        status: "Processing",
        buyer: { name: "Alice" },
        createAt: new Date().toISOString(),
        payment: { success: false },
        products: [{ _id: "p1", name: "Item A", description: "Short desc", price: 50 }],
      },
      {
        _id: "2",
        status: "Processing",
        buyer: { name: "Bob" },
        createAt: new Date().toISOString(),
        payment: { success: true },
        products: [{ _id: "p2", name: "Item B", description: "Short desc", price: 100 }],
      },
      {
        _id: "3",
        status: "Processing",
        buyer: { name: "Johnny" },
        createAt: new Date().toISOString(),
        payment: { success: true },
        products: [{ _id: "p3", name: "Item C", description: "Short desc", price: 150 }],
      },
    ];

    axios.get.mockResolvedValue({ data: mockOrders });

    await act(async () => {
      render(
        <MemoryRouter>
          <Orders />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getAllByText("Processing")).toHaveLength(3);

      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Item A")).toBeInTheDocument();
      expect(screen.getByText("Price : 50")).toBeInTheDocument();

      expect(screen.getByText("Bob")).toBeInTheDocument();
      expect(screen.getByText("Item B")).toBeInTheDocument();
      expect(screen.getByText("Price : 100")).toBeInTheDocument();

      expect(screen.getByText("Johnny")).toBeInTheDocument();
      expect(screen.getByText("Item C")).toBeInTheDocument();
      expect(screen.getByText("Price : 150")).toBeInTheDocument();
    });
  });

  it("renders multiple orders with different status correctly", async () => {
    useAuth.mockReturnValue([{ token: "mockedToken" }]);

    const mockOrders = [
      {
        _id: "1",
        status: "Processing",
        buyer: { name: "Alice" },
        createAt: new Date().toISOString(),
        payment: { success: false },
        products: [{ _id: "p1", name: "Item A", description: "Short desc", price: 50 }],
      },
      {
        _id: "2",
        status: "Shipped",
        buyer: { name: "Bob" },
        createAt: new Date().toISOString(),
        payment: { success: true },
        products: [{ _id: "p2", name: "Item B", description: "Short desc", price: 100 }],
      },
      {
        _id: "3",
        status: "Cancelled",
        buyer: { name: "Johnny" },
        createAt: new Date().toISOString(),
        payment: { success: true },
        products: [{ _id: "p3", name: "Item C", description: "Short desc", price: 150 }],
      },
    ];

    axios.get.mockResolvedValue({ data: mockOrders });

    await act(async () => {
      render(
        <MemoryRouter>
          <Orders />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Processing")).toBeInTheDocument();
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Item A")).toBeInTheDocument();
      expect(screen.getByText("Price : 50")).toBeInTheDocument();

      expect(screen.getByText("Shipped")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
      expect(screen.getByText("Item B")).toBeInTheDocument();
      expect(screen.getByText("Price : 100")).toBeInTheDocument();

      expect(screen.getByText("Cancelled")).toBeInTheDocument();
      expect(screen.getByText("Johnny")).toBeInTheDocument();
      expect(screen.getByText("Item C")).toBeInTheDocument();
      expect(screen.getByText("Price : 150")).toBeInTheDocument();
    });
  });

  it("renders a large order list without crashing", async () => {
    useAuth.mockReturnValue([{ token: "mockedToken" }]);

    const largeOrders = Array.from({ length: 100 }, (_, i) => ({
      _id: `${i + 1}`,
      status: "Delivered",
      buyer: { name: `Buyer ${i + 1}` },
      createAt: new Date().toISOString(),
      payment: { success: true },
      products: [{ _id: `p${i + 1}`, name: `Product ${i + 1}`, description: "Short desc", price: 10 }],
    }));

    axios.get.mockResolvedValue({ data: largeOrders });

    await act(async () => {
      render(
        <MemoryRouter>
          <Orders />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText("All Orders")).toBeInTheDocument();
      expect(screen.getAllByText("Delivered")).toHaveLength(100);
      expect(screen.getByText("Product 1")).toBeInTheDocument();
      expect(screen.getByText("Product 100")).toBeInTheDocument();
    });
  });

  test("handles API error gracefully", async () => {
    useAuth.mockReturnValue([{ token: "mockedToken" }]);

    axios.get.mockRejectedValue(new Error("API Error"));

    await act(async () => {
      render(
        <MemoryRouter>
          <Orders />
        </MemoryRouter>
      );
    });

    expect(screen.getByText("All Orders")).toBeInTheDocument();
  });

  it("does not call getOrders when user is not authenticated", async () => {
    useAuth.mockReturnValue([null]);
  
    const getOrdersSpy = jest.spyOn(axios, "get").mockImplementation((url) => {
      if (url.includes("/api/v1/orders")) {
        return Promise.reject(new Error("Should not be called"));
      }
      return Promise.resolve({ data: [] }); 
    });
  
    await act(async () => {
      render(
        <MemoryRouter>
          <Orders />
        </MemoryRouter>
      );
    });
  
    expect(screen.getByText("All Orders")).toBeInTheDocument();
  
    expect(getOrdersSpy).not.toHaveBeenCalledWith("/api/v1/orders");

    getOrdersSpy.mockRestore();
  });
  
  
});

