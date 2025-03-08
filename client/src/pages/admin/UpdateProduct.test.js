import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import { MemoryRouter, Routes, Route, useParams } from "react-router-dom";
import axios from "axios";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import UpdateProduct from "./UpdateProduct";

jest.mock("axios");
jest.mock("react-hot-toast");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useParams: jest.fn(),
    useNavigate: () => mockNavigate,
}));

jest.mock("../../components/Layout", () => ({ children }) => (
    <div data-testid="layout">{children}</div>
));

jest.mock("../../components/AdminMenu", () => () => <div data-testid="admin-menu" />);

global.URL.createObjectURL = jest.fn(() => "mocked-url");

describe("UpdateProduct Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useParams.mockReturnValue({ slug: "macbook" });
    });

    describe("Getting and displaying categories", () => {
        beforeEach(() => {
            axios.get.mockReset();
            axios.get.mockResolvedValueOnce({
                data: {
                    product: {
                        _id: "123",
                        name: "Test Product",
                        description: "Test Description",
                        price: 100,
                        quantity: 5,
                        shipping: true,
                        category: { _id: "1" },
                    },
                },
            });
        });

        test("correctly populates all categories", async () => {
            axios.get.mockResolvedValueOnce({
                data: {
                    success: true,
                    category: [
                        { _id: "1", name: "Electronics" },
                        { _id: "2", name: "Clothing" },
                    ],
                },
            });

            await act(async () => {
                render(
                    <MemoryRouter initialEntries={["/admin/product/macbook"]}>
                        <Routes>
                            <Route path="/admin/product/:slug" element={<UpdateProduct />} />
                        </Routes>
                    </MemoryRouter>
                )
            });

            const categoryDropdown = screen.getAllByRole("combobox")[0];
            fireEvent.mouseDown(categoryDropdown);
            expect(screen.getAllByText("Electronics")[1]).toBeInTheDocument(); // Electronics appears in the dropdown and also as the selected option
            expect(screen.getByText("Clothing")).toBeInTheDocument();
        });

        test("failed in getting categories", async () => {
            axios.get.mockResolvedValueOnce({
                data: { success: false }
            });

            await act(async () => {
                render(
                    <MemoryRouter initialEntries={["/admin/product/macbook"]}>
                        <Routes>
                            <Route path="/admin/product/:slug" element={<UpdateProduct />} />
                        </Routes>
                    </MemoryRouter>
                )
            });

            expect(toast.error).toHaveBeenCalled();
        });

        test("error when getting categories", async () => {
            axios.get.mockRejectedValueOnce(new Error("Network error"));

            await act(async () => {
                render(
                    <MemoryRouter initialEntries={["/admin/product/macbook"]}>
                        <Routes>
                            <Route path="/admin/product/:slug" element={<UpdateProduct />} />
                        </Routes>
                    </MemoryRouter>
                )
            });

            expect(toast.error).toHaveBeenCalled();
        });
    });

    describe("Getting and displaying product information", () => {
        beforeEach(() => {
            axios.get.mockReset();
        });

        test("correctly populates all product information", async () => {
            axios.get.mockResolvedValueOnce({
                data: {
                    product: {
                        _id: "123",
                        name: "Test Product",
                        description: "Test Description",
                        price: 100,
                        quantity: 5,
                        shipping: true,
                        category: { _id: "1" },
                    },
                },
            });

            axios.get.mockResolvedValueOnce({
                data: {
                    success: true,
                    category: [
                        { _id: "1", name: "Electronics" },
                        { _id: "2", name: "Clothing" },
                    ],
                },
            });

            await act(async () => {
                render(
                    <MemoryRouter initialEntries={["/admin/product/macbook"]}>
                        <Routes>
                            <Route path="/admin/product/:slug" element={<UpdateProduct />} />
                        </Routes>
                    </MemoryRouter>
                )
            });

            expect(screen.getByDisplayValue("Test Product")).toBeInTheDocument();
            expect(screen.getByDisplayValue("Test Description")).toBeInTheDocument();
            expect(screen.getByDisplayValue("100")).toBeInTheDocument();
            expect(screen.getByDisplayValue("5")).toBeInTheDocument();
            expect(screen.getByText("Yes")).toBeInTheDocument();
            expect(screen.getByText("Electronics")).toBeInTheDocument();
            expect(screen.getByRole("img")).toBeInTheDocument();
            expect(screen.getByRole("img")).toHaveAttribute("src", "/api/v1/product/product-photo/123");
            expect(axios.get).toHaveBeenCalledWith("/api/v1/product/get-product/macbook");
        });

        test("error when getting product information", async () => {
            const mockError = new Error("Network error");
            axios.get.mockRejectedValueOnce(mockError);
            jest.spyOn(console, "log").mockImplementation(() => { });

            await act(async () => {
                render(
                    <MemoryRouter initialEntries={["/admin/product/macbook"]}>
                        <Routes>
                            <Route path="/admin/product/:slug" element={<UpdateProduct />} />
                        </Routes>
                    </MemoryRouter>
                )
            });

            expect(console.log).toHaveBeenCalledWith(mockError);
        });
    });

    describe("Updating product information", () => {
        beforeEach(() => {
            axios.mockReset();
            axios.get.mockResolvedValueOnce({
                data: {
                    product: {
                        _id: "123",
                        name: "Test Product",
                        description: "Test Description",
                        price: 100,
                        quantity: 5,
                        shipping: true,
                        category: { _id: "1" },
                    },
                },
            });
            axios.get.mockResolvedValueOnce({
                data: {
                    success: true,
                    category: [
                        { _id: "1", name: "Electronics" },
                        { _id: "2", name: "Clothing" },
                    ],
                },
            });
        });

        test("handles product update successfully", async () => {
            axios.put.mockResolvedValueOnce({
                data: { success: true, message: "Product updated" },
            });

            await act(async () => {
                render(
                    <MemoryRouter initialEntries={["/admin/product/macbook"]}>
                        <Routes>
                            <Route path="/admin/product/:slug" element={<UpdateProduct />} />
                        </Routes>
                    </MemoryRouter>
                )
            });

            fireEvent.change(screen.getByDisplayValue("Test Product"), {
                target: { value: "Updated Name" },
            });
            fireEvent.change(screen.getByDisplayValue("Test Description"), {
                target: { value: "Updated Description" },
            });
            fireEvent.change(screen.getByDisplayValue("100"), {
                target: { value: 200 },
            });
            fireEvent.change(screen.getByDisplayValue("5"), {
                target: { value: 10 },
            });
            const categoryDropdown = screen.getAllByRole("combobox")[0];
            fireEvent.mouseDown(categoryDropdown);
            await waitFor(() => expect(screen.getByText('Clothing')).toBeInTheDocument());
            fireEvent.click(screen.getByText("Clothing"));

            const shippingDropdown = screen.getAllByRole("combobox")[1];
            fireEvent.mouseDown(shippingDropdown);
            await waitFor(() => expect(screen.getByText('No')).toBeInTheDocument());
            fireEvent.click(screen.getByText("No"));

            const file = new File(["photo"], "photo.jpg", { type: "image/jpeg" });
            fireEvent.change(screen.getByLabelText("Upload Photo"), {
                target: { files: [file] },
            });
            await waitFor(() => expect(screen.getByText("photo.jpg")).toBeInTheDocument());

            fireEvent.click(screen.getByText("UPDATE PRODUCT"));

            await waitFor(() => expect(axios.put).toHaveBeenCalled());
            expect(toast.success).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
        });

        test("correctly sends all form data when updating a product", async () => {
            axios.put.mockResolvedValueOnce({
                data: { success: true, message: "Product updated" },
            });

            await act(async () => {
                render(
                    <MemoryRouter initialEntries={["/admin/product/macbook"]}>
                        <Routes>
                            <Route path="/admin/product/:slug" element={<UpdateProduct />} />
                        </Routes>
                    </MemoryRouter>
                )
            });

            fireEvent.change(screen.getByDisplayValue("Test Product"), {
                target: { value: "Updated Name" },
            });
            fireEvent.change(screen.getByDisplayValue("Test Description"), {
                target: { value: "Updated Description" },
            });
            fireEvent.change(screen.getByDisplayValue("100"), {
                target: { value: 200 },
            });
            fireEvent.change(screen.getByDisplayValue("5"), {
                target: { value: 10 },
            });
            const categoryDropdown = screen.getAllByRole("combobox")[0];
            fireEvent.mouseDown(categoryDropdown);
            await waitFor(() => expect(screen.getByText('Clothing')).toBeInTheDocument());
            fireEvent.click(screen.getByText("Clothing"));

            const shippingDropdown = screen.getAllByRole("combobox")[1];
            fireEvent.mouseDown(shippingDropdown);
            await waitFor(() => expect(screen.getByText('No')).toBeInTheDocument());
            fireEvent.click(screen.getByText("No"));

            const file = new File(["photo"], "photo.jpg", { type: "image/jpeg" });
            fireEvent.change(screen.getByLabelText("Upload Photo"), {
                target: { files: [file] },
            });

            fireEvent.click(screen.getByText("UPDATE PRODUCT"));

            const expectedFormData = {
                name: "Updated Name",
                description: "Updated Description",
                price: "200",
                quantity: "10",
                photo: {
                    name: "photo.jpg",
                    type: "image/jpeg",
                },
                category: "2",
                shipping: "false",
            };

            const formDataToObject = (formData) => {
                const obj = {};
                formData.forEach((value, key) => {
                    if (key === "photo") {
                        obj["photo"] = {
                            name: value.name,
                            type: value.type
                        };
                    } else {
                        obj[key] = value;
                    }
                });
                return obj;
            };

            expect(axios.put).toHaveBeenCalled();
            const actualFormData = axios.put.mock.calls[0][1];
            expect(formDataToObject(actualFormData)).toEqual(expectedFormData);
        });

        test("handles product update failure", async () => {
            axios.put.mockResolvedValueOnce({
                data: {
                    success: false,
                    message: "Product update failed"
                }
            });

            await act(async () => {
                render(
                    <MemoryRouter initialEntries={["/admin/product/macbook"]}>
                        <Routes>
                            <Route path="/admin/product/:slug" element={<UpdateProduct />} />
                        </Routes>
                    </MemoryRouter>
                )
            });

            fireEvent.change(screen.getByDisplayValue("Test Product"), {
                target: { value: "Updated Name" },
            });
            fireEvent.change(screen.getByDisplayValue("Test Description"), {
                target: { value: "Updated Description" },
            });
            fireEvent.change(screen.getByDisplayValue("100"), {
                target: { value: 200 },
            });
            fireEvent.change(screen.getByDisplayValue("5"), {
                target: { value: 10 },
            });
            const categoryDropdown = screen.getAllByRole("combobox")[0];
            fireEvent.mouseDown(categoryDropdown);
            await waitFor(() => expect(screen.getByText('Clothing')).toBeInTheDocument());
            fireEvent.click(screen.getByText("Clothing"));

            const shippingDropdown = screen.getAllByRole("combobox")[1];
            fireEvent.mouseDown(shippingDropdown);
            await waitFor(() => expect(screen.getByText('No')).toBeInTheDocument());
            fireEvent.click(screen.getByText("No"));

            const file = new File(["photo"], "photo.jpg", { type: "image/jpeg" });
            fireEvent.change(screen.getByLabelText("Upload Photo"), {
                target: { files: [file] },
            });

            fireEvent.click(screen.getByText("UPDATE PRODUCT"));

            expect(axios.put).toHaveBeenCalled();
            await waitFor(() => expect(toast.error).toHaveBeenCalled());
        });

        test("error when updating product", async () => {
            axios.put.mockRejectedValueOnce(new Error("Network error"));

            await act(async () => {
                render(
                    <MemoryRouter initialEntries={["/admin/product/macbook"]}>
                        <Routes>
                            <Route path="/admin/product/:slug" element={<UpdateProduct />} />
                        </Routes>
                    </MemoryRouter>
                )
            });

            fireEvent.change(screen.getByDisplayValue("Test Product"), {
                target: { value: "Updated Name" },
            });
            fireEvent.change(screen.getByDisplayValue("Test Description"), {
                target: { value: "Updated Description" },
            });
            fireEvent.change(screen.getByDisplayValue("100"), {
                target: { value: 200 },
            });
            fireEvent.change(screen.getByDisplayValue("5"), {
                target: { value: 10 },
            });
            const categoryDropdown = screen.getAllByRole("combobox")[0];
            fireEvent.mouseDown(categoryDropdown);
            await waitFor(() => expect(screen.getByText('Clothing')).toBeInTheDocument());
            fireEvent.click(screen.getByText("Clothing"));

            const shippingDropdown = screen.getAllByRole("combobox")[1];
            fireEvent.mouseDown(shippingDropdown);
            await waitFor(() => expect(screen.getByText('No')).toBeInTheDocument());
            fireEvent.click(screen.getByText("No"));

            const file = new File(["photo"], "photo.jpg", { type: "image/jpeg" });
            fireEvent.change(screen.getByLabelText("Upload Photo"), {
                target: { files: [file] },
            });

            fireEvent.click(screen.getByText("UPDATE PRODUCT"));

            await waitFor(() => expect(toast.error).toHaveBeenCalled());
        });

        // Equivalence partitioning for price field
        test("price field > 0", async () => {
            axios.put.mockResolvedValueOnce({
                data: { success: true, message: "Product updated" },
            });

            await act(async () => {
                render(
                    <MemoryRouter initialEntries={["/admin/product/macbook"]}>
                        <Routes>
                            <Route path="/admin/product/:slug" element={<UpdateProduct />} />
                        </Routes>
                    </MemoryRouter>
                )
            });

            fireEvent.change(screen.getByDisplayValue("100"), {
                target: { value: 200 },
            });

            fireEvent.click(screen.getByText("UPDATE PRODUCT"));

            await waitFor(() => expect(axios.put).toHaveBeenCalled());
            expect(toast.success).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
        });
    
        test("error when price field is <= 0", async () => {
            await act(async () => {
                render(
                    <MemoryRouter initialEntries={["/admin/product/macbook"]}>
                        <Routes>
                            <Route path="/admin/product/:slug" element={<UpdateProduct />} />
                        </Routes>
                    </MemoryRouter>
                )
            });

            fireEvent.change(screen.getByDisplayValue("100"), {
                target: { value: -1 },
            });

            fireEvent.click(screen.getByText("UPDATE PRODUCT"));

            await waitFor(() => expect(toast.error).toHaveBeenCalled());
        });

        // BVA for price field
        test("price field is 0.01", async () => {
            axios.put.mockResolvedValueOnce({
                data: { success: true, message: "Product updated" },
            });

            await act(async () => {
                render(
                    <MemoryRouter initialEntries={["/admin/product/macbook"]}>
                        <Routes>
                            <Route path="/admin/product/:slug" element={<UpdateProduct />} />
                        </Routes>
                    </MemoryRouter>
                )
            });

            fireEvent.change(screen.getByDisplayValue("100"), {
                target: { value: 0.01 },
            });

            fireEvent.click(screen.getByText("UPDATE PRODUCT"));

            await waitFor(() => expect(axios.put).toHaveBeenCalled());
            expect(toast.success).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
        });

        test("error when price field is = 0", async () => {
            await act(async () => {
                render(
                    <MemoryRouter initialEntries={["/admin/product/macbook"]}>
                        <Routes>
                            <Route path="/admin/product/:slug" element={<UpdateProduct />} />
                        </Routes>
                    </MemoryRouter>
                )
            });

            fireEvent.change(screen.getByDisplayValue("100"), {
                target: { value: 0 },
            });

            fireEvent.click(screen.getByText("UPDATE PRODUCT"));

            await waitFor(() => expect(toast.error).toHaveBeenCalled());
        });

        // Equivalence partitioning for quantity field
        test("quantity field > 0", async () => {
            axios.put.mockResolvedValueOnce({
                data: { success: true, message: "Product updated" },
            });

            await act(async () => {
                render(
                    <MemoryRouter initialEntries={["/admin/product/macbook"]}>
                        <Routes>
                            <Route path="/admin/product/:slug" element={<UpdateProduct />} />
                        </Routes>
                    </MemoryRouter>
                )
            });

            fireEvent.change(screen.getByDisplayValue("100"), {
                target: { value: 200 },
            });

            fireEvent.click(screen.getByText("UPDATE PRODUCT"));

            await waitFor(() => expect(axios.put).toHaveBeenCalled());
            expect(toast.success).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
        });
    
        test("error when quantity field is <= 0", async () => {
            await act(async () => {
                render(
                    <MemoryRouter initialEntries={["/admin/product/macbook"]}>
                        <Routes>
                            <Route path="/admin/product/:slug" element={<UpdateProduct />} />
                        </Routes>
                    </MemoryRouter>
                )
            });

            fireEvent.change(screen.getByDisplayValue("5"), {
                target: { value: -1 },
            });

            fireEvent.click(screen.getByText("UPDATE PRODUCT"));

            await waitFor(() => expect(toast.error).toHaveBeenCalled());
        });

        // BVA for quantity field
        test("quantity field is 1", async () => {
            axios.put.mockResolvedValueOnce({
                data: { success: true, message: "Product updated" },
            });

            await act(async () => {
                render(
                    <MemoryRouter initialEntries={["/admin/product/macbook"]}>
                        <Routes>
                            <Route path="/admin/product/:slug" element={<UpdateProduct />} />
                        </Routes>
                    </MemoryRouter>
                )
            });

            fireEvent.change(screen.getByDisplayValue("5"), {
                target: { value: 1 },
            });

            fireEvent.click(screen.getByText("UPDATE PRODUCT"));

            await waitFor(() => expect(axios.put).toHaveBeenCalled());
            expect(toast.success).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
        });

        test("error when quantity field is = 0", async () => {
            await act(async () => {
                render(
                    <MemoryRouter initialEntries={["/admin/product/macbook"]}>
                        <Routes>
                            <Route path="/admin/product/:slug" element={<UpdateProduct />} />
                        </Routes>
                    </MemoryRouter>
                )
            });

            fireEvent.change(screen.getByDisplayValue("5"), {
                target: { value: 0 },
            });

            fireEvent.click(screen.getByText("UPDATE PRODUCT"));

            await waitFor(() => expect(toast.error).toHaveBeenCalled());
        });

        test("error when required fields are empty", async () => {
            await act(async () => {
                render(
                    <MemoryRouter initialEntries={["/admin/product/macbook"]}>
                        <Routes>
                            <Route path="/admin/product/:slug" element={<UpdateProduct />} />
                        </Routes>
                    </MemoryRouter>
                )
            });

            fireEvent.change(screen.getByDisplayValue("Test Product"), {
                target: { value: "" },
            });

            fireEvent.click(screen.getByText("UPDATE PRODUCT"));

            await waitFor(() => expect(toast.error).toHaveBeenCalled());
        });
    });

    describe("Deleting product information", () => {
        beforeEach(() => {
            axios.mockReset();
            axios.get.mockResolvedValueOnce({
                data: {
                    product: {
                        _id: "123",
                        name: "Test Product",
                        description: "Test Description",
                        price: 100,
                        quantity: 5,
                        shipping: true,
                        category: { _id: "1" },
                    },
                },
            });
            axios.get.mockResolvedValueOnce({
                data: {
                    success: true,
                    category: [
                        { _id: "1", name: "Electronics" },
                        { _id: "2", name: "Clothing" },
                    ],
                },
            });
        });

        test("handles product deletion successfully", async () => {
            window.prompt = jest.fn().mockReturnValue("yes");

            axios.delete.mockResolvedValueOnce({
                data: { success: true, message: "Product deleted" },
            });

            await act(async () => {
                render(
                    <MemoryRouter initialEntries={["/admin/product/macbook"]}>
                        <Routes>
                            <Route path="/admin/product/:slug" element={<UpdateProduct />} />
                        </Routes>
                    </MemoryRouter>
                )
            });

            fireEvent.click(screen.getByText("DELETE PRODUCT"));

            expect(window.prompt).toHaveBeenCalledWith("Are You Sure want to delete this product ? ");
            await waitFor(() => expect(axios.delete).toHaveBeenCalledWith(
                "/api/v1/product/delete-product/123"
            ));
            expect(toast.success).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
        });

        test("handles product deletion cancellation", async () => {
            window.prompt = jest.fn().mockReturnValue(null);

            await act(async () => {
                render(
                    <MemoryRouter initialEntries={["/admin/product/macbook"]}>
                        <Routes>
                            <Route path="/admin/product/:slug" element={<UpdateProduct />} />
                        </Routes>
                    </MemoryRouter>
                )
            });

            fireEvent.click(screen.getByText("DELETE PRODUCT"));

            expect(window.prompt).toHaveBeenCalledWith("Are You Sure want to delete this product ? ");
            expect(axios.delete).not.toHaveBeenCalled();
        });

        test("handles product deletion failure", async () => {
            window.prompt = jest.fn().mockReturnValue("yes");

            axios.delete.mockResolvedValueOnce({
                data: { success: false, message: "Failed to delete product" },
            });

            await act(async () => {
                render(
                    <MemoryRouter initialEntries={["/admin/product/macbook"]}>
                        <Routes>
                            <Route path="/admin/product/:slug" element={<UpdateProduct />} />
                        </Routes>
                    </MemoryRouter>
                )
            });

            fireEvent.click(screen.getByText("DELETE PRODUCT"));

            await waitFor(() => expect(toast.error).toHaveBeenCalled());
        });

        test("error when deleting product", async () => {
            window.prompt = jest.fn().mockReturnValue("yes");

            axios.delete.mockRejectedValueOnce(new Error("Network error"));

            await act(async () => {
                render(
                    <MemoryRouter initialEntries={["/admin/product/macbook"]}>
                        <Routes>
                            <Route path="/admin/product/:slug" element={<UpdateProduct />} />
                        </Routes>
                    </MemoryRouter>
                )
            });

            fireEvent.click(screen.getByText("DELETE PRODUCT"));

            await waitFor(() => expect(toast.error).toHaveBeenCalled());
        });
    });
});