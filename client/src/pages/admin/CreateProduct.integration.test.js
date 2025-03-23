import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import CreateProduct from "./CreateProduct";
import Products from "./Products";
import toast from "react-hot-toast";

axios.defaults.baseURL = 'http://localhost:6060';
axios.defaults.headers.common['Authorization'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2RmOWRkZDczNDQ4MmE3NWUzODMyMDgiLCJpYXQiOjE3NDI3Mjg4NDQsImV4cCI6MTc0MzMzMzY0NH0.yVBQ2vX9zTeyI7uik-KLso5XbibHhE3mgportbZ8fik';

jest.mock("react-hot-toast");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

jest.mock("../../context/auth", () => ({
    useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../../context/cart", () => ({
    useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../../context/search", () => ({
    useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

jest.mock("../../hooks/useCategory", () => jest.fn(() => [])); // Mock useCategory hook to return an empty array

global.URL.createObjectURL = jest.fn(() => "mocked-url");

window.prompt = jest.fn().mockReturnValue("yes");

describe("CreateProduct Component", () => {
    let categoryId;
    let spy = jest.spyOn(axios, "post");

    beforeEach(async () => {
        jest.clearAllMocks();
        spy.mockClear();
        const categoryResponse = await axios.post("/api/v1/category/create-category", {
            name: "integrationTestCategories"
        });
        expect(spy).toHaveBeenCalledTimes(1);
        categoryId = categoryResponse.data.category._id;
        await act(async () => {
            render(
                <MemoryRouter initialEntries={["/admin/create-product"]}>
                    <Routes>
                        <Route path="/admin/create-product" element={<CreateProduct />} />
                    </Routes>
                </MemoryRouter>
            );
        });
    });

    afterEach(async () => {
        // clean up by deleting category and product
        const createdProductResponse = await spy.mock.results[1].value
        const productId = createdProductResponse.data.products._id;
        await axios.delete("/api/v1/product/delete-product/" + productId);
        await axios.delete("/api/v1/category/delete-category/" + categoryId);
    });

    test("successfully creates a product and displays in product list", async () => {
        fireEvent.change(screen.getByPlaceholderText("write a name"), {
            target: { value: "Test Product Name" },
        });
        fireEvent.change(screen.getByPlaceholderText("write a description"), {
            target: { value: "Test Product Description" },
        });
        fireEvent.change(screen.getByPlaceholderText("write a Price"), {
            target: { value: 100 },
        });
        fireEvent.change(screen.getByPlaceholderText("write a quantity"), {
            target: { value: 10 },
        });

        const categoryDropdown = screen.getAllByRole("combobox")[0];
        fireEvent.mouseDown(categoryDropdown);
        await waitFor(() => expect(screen.getByText('integrationTestCategories')).toBeInTheDocument());
        fireEvent.click(screen.getByText('integrationTestCategories'));

        const shippingDropdown = screen.getAllByRole("combobox")[1];
        fireEvent.mouseDown(shippingDropdown);
        await waitFor(() => expect(screen.getByText('Yes')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Yes'));

        const file = new File(["photo"], "photo.jpg", { type: "image/jpeg" });
        fireEvent.change(screen.getByLabelText("Upload Photo"), {
            target: { files: [file] },
        });

        fireEvent.click(screen.getByText("CREATE PRODUCT"));

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(2);
        });

        await act(async () => {
            render(
                <MemoryRouter initialEntries={['/dashboard/admin/products']}>
                    <Routes>
                        <Route path="/dashboard/admin/products" element={<Products />} />
                    </Routes>
                </MemoryRouter>
            )
        });

        await waitFor(() => {
            expect(screen.getByText("Test Product Name")).toBeInTheDocument();
        });
    });
});