import React from "react";
import axios from "axios";
import { render, waitFor, screen, act, fireEvent } from "@testing-library/react";
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from "react-router-dom";
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
];
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
        expect(axios.get).toHaveBeenCalledTimes(1);
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
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(screen.getByText("All Orders")).toBeInTheDocument();
        // Test Column headers
        expect(screen.getByText("#")).toBeInTheDocument();
        expect(screen.getByText("Status")).toBeInTheDocument();
        expect(screen.getByText("Buyer")).toBeInTheDocument();
        expect(screen.getByText("Date")).toBeInTheDocument();
        expect(screen.getByText("Payment")).toBeInTheDocument();
        expect(screen.getByText("Quantity")).toBeInTheDocument();
        // Test Order information
        expect(screen.getByText(mockOrders[0].status)).toBeInTheDocument();
        expect(screen.getByText(mockOrders[0].buyer.name)).toBeInTheDocument();
        expect(screen.getByText(moment(mockOrders[0].createAt).fromNow())).toBeInTheDocument();
        expect(screen.getByText(mockOrders[0].products.length)).toBeInTheDocument();
        expect(screen.getByText(mockOrders[0].products[0].name)).toBeInTheDocument();
        expect(screen.getByText(mockOrders[0].products[0].description)).toBeInTheDocument();
        expect(screen.getByText(`Price : ${mockOrders[0].products[0].price}`)).toBeInTheDocument();
        expect(screen.getByText(mockOrders[0].products[1].name)).toBeInTheDocument();
        expect(screen.getByText(mockOrders[0].products[1].description)).toBeInTheDocument();
        expect(screen.getByText(`Price : ${mockOrders[0].products[1].price}`)).toBeInTheDocument();
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
      axios.put.mockResolvedValueOnce({ data: { status: "Delivered" } });

      await act(async () => {
        const { getByText } = render(
          <MemoryRouter initialEntries={["/admin/orders"]}>
            <Routes>
              <Route path="/admin/orders" element={<AdminOrders />} />
            </Routes>
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText(mockOrders[0].status)).toBeInTheDocument();
      });

      // Open the Select dropdown
      const selectDropdown = screen.getByTestId("select").firstElementChild;

      fireEvent.mouseDown(selectDropdown);

      // Wait for the dropdown option to appear (Ant Design renders it in a portal)
      await waitFor(() => expect(getByText('Shipped')).toBeVisible());

      // Click the option
      fireEvent.mouseDown(screen.getByText('Shipped'));
      // Check if options are rendered
      // options.forEach((option) => {
      //   expect(screen.getByText(option.label)).toBeInTheDocument();
      // });

      // Change the selected option to "Shipped"
      // fireEvent.click(screen.getByText((content, element) => {
      //   return element?.textContent === 'Shipped';
      // }));

      await waitFor(() => {
        expect(screen.getByText("Shipped")).toBeInTheDocument;
        expect(axios.put).toHaveBeenCalledTimes(1);
        expect(axios.put).toHaveBeenCalledWith(`/api/v1/auth/order-status/${mockOrders[0]._id}`, { status: "Shipped" });
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
        expect(console.log).toHaveBeenCalledTimes(1);
        expect(console.log.mock.calls[0][0].message).toContain("Async error");
      });
    });
});
