import React from "react";
import axios from "axios";
import { render, waitFor, screen, act, fireEvent } from "@testing-library/react";
import { Routes, Route, MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import AdminOrders from "./AdminOrders";
import moment from "moment";

jest.mock("axios");
jest.mock("../../hooks/useCategory");
jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [{ token: "admin" }, jest.fn()]), // Mock useAuth hook to return null state and a mock function
})); 

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));
const mockOrders = [
  {
    _id: "1",
    status: "Processing",
    buyer: { _id: "1", name: "John Doe" },
    createAt: "2025-02-08T10:30:00Z",
    payment: { success: true },
    products: [
      {
        _id: "101",
        name: "Product 1",
        description: "Description for Product 1",
        price: 10,
        category: "Category1",
        quantity: 5,
        photo: {
          data: null,
          contentType: "",
        },
        shipping: true,
      },
      {
        _id: "102",
        name: "Product 2",
        description: "Description for Product 2",
        price: 20,
        category: "Category2",
        quantity: 3,
        photo: {
          data: null,
          contentType: "",
        },
        shipping: true,
      },
    ],
  },
  {
    _id: "2",
    status: "Cancelled",
    buyer: { _id: "1", name: "John Doe" },
    createAt: "2025-02-08T10:30:00Z",
    payment: { success: false },
    products: [
      {
        _id: "101",
        name: "Product 1",
        description: "Description for Product 1",
        price: 10,
        category: "Category1",
        quantity: 5,
        photo: {
          data: null,
          contentType: "",
        },
        shipping: true,
      },
      {
        _id: "102",
        name: "Product 2",
        description: "Description for Product 2",
        price: 20,
        category: "Category2",
        quantity: 3,
        photo: {
          data: null,
          contentType: "",
        },
        shipping: true,
      },
    ],
  },
];

// test that the AdminOrders component renders correctly
describe("AdminOrders Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    console.log.mockRestore();
  });

  afterEach(() => {
    console.log.mockClear();
  });

  it("renders if no orders", async () => {
      axios.get.mockResolvedValueOnce({ data: [] });
      await act(async () => {
        render(
          <MemoryRouter initialEntries={["/admin/orders"]}>
            <Routes>
              <Route path="/admin/orders" element={<AdminOrders />} />
            </Routes>
          </MemoryRouter>
        );
      });
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/all-orders");
      });
      expect(screen.getByText("All Orders")).toBeInTheDocument();
  });

  it("renders admin orders with mock data", async () => {
    axios.get.mockResolvedValueOnce({ data: mockOrders });

    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/admin/orders"]}>
          <Routes>
            <Route path="/admin/orders" element={<AdminOrders />} />
          </Routes>
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/all-orders");
      expect(screen.getByText("All Orders")).toBeInTheDocument();
      // Test Column headers
      expect(screen.getAllByText("#")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Status")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Buyer")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Date")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Payment")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Quantity")[0]).toBeInTheDocument();
      // Test Order information
      expect(screen.getAllByText(mockOrders[0].status)[0]).toBeInTheDocument();
      expect(screen.getAllByText(mockOrders[0].buyer.name)[0]).toBeInTheDocument();
      expect(screen.getAllByText(moment(mockOrders[0].createAt).fromNow())[0]).toBeInTheDocument();
      expect(screen.getAllByText(mockOrders[0].products.length)[0]).toBeInTheDocument();
      expect(screen.getAllByText(mockOrders[0].products[0].name)[0]).toBeInTheDocument();
      expect(screen.getAllByText(mockOrders[0].products[0].description)[0]).toBeInTheDocument();
      expect(screen.getAllByText(`Price : ${mockOrders[0].products[0].price}`)[0]).toBeInTheDocument();
      expect(screen.getAllByText(mockOrders[0].products[1].name)[0]).toBeInTheDocument();
      expect(screen.getAllByText(mockOrders[0].products[1].description)[0]).toBeInTheDocument();
      expect(screen.getAllByText(`Price : ${mockOrders[0].products[1].price}`)[0]).toBeInTheDocument();
    });
  });

  it("handles error when fetching orders", async () => {
    const error = new Error("Async error");
    axios.get.mockRejectedValueOnce(error);
    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/admin/orders"]}>
          <Routes>
            <Route path="/admin/orders" element={<AdminOrders />} />
          </Routes>
        </MemoryRouter>
      );
    });
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/all-orders");
      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log.mock.calls[0][0].message).toContain("Async error");
    });
  });

  it("handles updating order status", async () => {
    const options = [
      { value: '1', label: "Not Processed" },
      { value: '2', label: "Processing" },
      { value: '3', label: "Shipped" },
      { value: '4', label: "Delivered" },
      { value: '5', label: "Cancelled" },
    ];

    axios.get.mockResolvedValueOnce({ data: mockOrders });
    axios.put.mockResolvedValueOnce({ data: { success: true } });

    const {  getAllByRole, getAllByText, getByText } = render(
      <MemoryRouter initialEntries={["/admin/orders"]}>
        <Routes>
          <Route path="/admin/orders" element={<AdminOrders />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/all-orders");
      expect(getByText(mockOrders[0].status)).toBeInTheDocument();
    });

    // Open the Select dropdown
    const selectDropdown = getAllByRole("combobox")[0];

    fireEvent.mouseDown(selectDropdown);
    // Wait for the dropdown option to appear (Ant Design renders it in a portal)
    await waitFor(() => expect(getByText('Shipped')).toBeInTheDocument());

    // Check if options are rendered
    options.forEach((option) => {
      expect(getAllByText(option.label)[0]).toBeInTheDocument();
    });

    // Click a new option
    fireEvent.click(getByText("Shipped"));

    // Check if put api is called
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(`/api/v1/auth/order-status/${mockOrders[0]._id}`, {status: "Shipped"});
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/all-orders");
    });
  });

  it("handles updating order status error", async () => {
    const options = [
      { value: '1', label: "Not Processed" },
      { value: '2', label: "Processing" },
      { value: '3', label: "Shipped" },
      { value: '4', label: "Delivered" },
      { value: '5', label: "Cancelled" },
    ];

    const error = new Error("Async error");
    axios.get.mockResolvedValueOnce({ data: mockOrders });
    axios.put.mockRejectedValueOnce(error);

    const {  getAllByRole, getAllByText, getByText } = render(
      <MemoryRouter initialEntries={["/admin/orders"]}>
        <Routes>
          <Route path="/admin/orders" element={<AdminOrders />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/all-orders");
      expect(getByText(mockOrders[0].status)).toBeInTheDocument();
    });

    // Open the Select dropdown
    const selectDropdown = getAllByRole("combobox")[0];

    fireEvent.mouseDown(selectDropdown);
    // Wait for the dropdown option to appear (Ant Design renders it in a portal)
    await waitFor(() => expect(getByText('Shipped')).toBeInTheDocument());

    // Check if options are rendered
    options.forEach((option) => {
      expect(getAllByText(option.label)[0]).toBeInTheDocument();
    });

    // Click a new option
    fireEvent.click(getByText("Shipped"));

    // Check if put api is called
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(`/api/v1/auth/order-status/${mockOrders[0]._id}`, {status: "Shipped"});
      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log.mock.calls[0][0].message).toContain("Async error");
    });
  });

  it("there isn't a valid auth token", async () => {
    // replace auth token with null
    require("../../context/auth").useAuth.mockImplementationOnce(() => [{ token: null }, jest.fn()]);

    render(
      <MemoryRouter initialEntries={["/admin/orders"]}>
        <Routes>
          <Route path="/admin/orders" element={<AdminOrders />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(0);
    });
  });
});
