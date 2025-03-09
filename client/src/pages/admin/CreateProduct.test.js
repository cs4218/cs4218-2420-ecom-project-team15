import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import CreateProduct from "./CreateProduct";

jest.mock("axios");
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

describe("CreateProduct Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        axios.get.mockReset();
        axios.get.mockResolvedValueOnce({
            data: {
                success: true,
                category: [ 
                    { _id: "1", name: "category1" },
                    { _id: "2", name: "category2" },
                    { _id: "3", name: "category3" }
                ]
            },
        });
    });

    test("category dropdown is correctly populated", async () => {
        await act(async () => {
            render(
                <MemoryRouter initialEntries={["/admin/create-product"]}>
                    <Routes>
                        <Route path="/admin/create-product" element={<CreateProduct />} />
                    </Routes>
                </MemoryRouter>
            );
        });

        const categoryDropdown = screen.getAllByRole("combobox")[0];
        fireEvent.mouseDown(categoryDropdown);

        expect(screen.getByText("category1")).toBeInTheDocument();
        expect(screen.getByText("category2")).toBeInTheDocument();
        expect(screen.getByText("category3")).toBeInTheDocument();
    });

    test("shows success message when successfully creates a product", async () => {
        axios.post.mockResolvedValueOnce({
            data: { 
                success: true, 
                message: "Product Created Successfully" 
            } 
        });

        await act(async () => {
            render(
                <MemoryRouter initialEntries={["/admin/create-product"]}>
                    <Routes>
                        <Route path="/admin/create-product" element={<CreateProduct />} />
                    </Routes>
                </MemoryRouter>
            );
        });

        fireEvent.change(screen.getByPlaceholderText("write a name"), {
            target: { value: "Product Name" },
        });
        fireEvent.change(screen.getByPlaceholderText("write a description"), {
            target: { value: "Product Description" },
        });
        fireEvent.change(screen.getByPlaceholderText("write a Price"), {
            target: { value: 100 },
        });
        fireEvent.change(screen.getByPlaceholderText("write a quantity"), {
            target: { value: 10 },
        });
        
        const categoryDropdown = screen.getAllByRole("combobox")[0];
        fireEvent.mouseDown(categoryDropdown);
        await waitFor(() => expect(screen.getByText('category1')).toBeInTheDocument());
        fireEvent.click(screen.getByText('category1'));

        const shippingDropdown = screen.getAllByRole("combobox")[1];
        fireEvent.mouseDown(shippingDropdown);
        await waitFor(() => expect(screen.getByText('Yes')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Yes'));

        const file = new File(["photo"], "photo.jpg", { type: "image/jpeg" });
        fireEvent.change(screen.getByLabelText("Upload Photo"), { 
            target: { files: [file] },
        });

        fireEvent.click(screen.getByText("CREATE PRODUCT"));

        await waitFor(() => expect(axios.post).toHaveBeenCalled());
        expect(toast.success).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
    });

    test("correctly sends all form data when creating a product", async () => {
        axios.post.mockResolvedValueOnce({
            data: { 
                success: true, 
                message: "Product Created Successfully" 
            } 
        });

        await act(async () => {
            render(
                <MemoryRouter initialEntries={["/admin/create-product"]}>
                    <Routes>
                        <Route path="/admin/create-product" element={<CreateProduct />} />
                    </Routes>
                </MemoryRouter>
            );
        });
        fireEvent.change(screen.getByPlaceholderText("write a name"), {
            target: { value: "Product Name" },
        });
        fireEvent.change(screen.getByPlaceholderText("write a description"), {
            target: { value: "Product Description" },
        });
        fireEvent.change(screen.getByPlaceholderText("write a Price"), {
            target: { value: 100 },
        });
        fireEvent.change(screen.getByPlaceholderText("write a quantity"), {
            target: { value: 10 },
        });

        const categoryDropdown = screen.getAllByRole("combobox")[0];
        fireEvent.mouseDown(categoryDropdown);
        await waitFor(() => expect(screen.getByText('category1')).toBeInTheDocument());
        fireEvent.click(screen.getByText('category1'));

        const shippingDropdown = screen.getAllByRole("combobox")[1];
        fireEvent.mouseDown(shippingDropdown);
        await waitFor(() => expect(screen.getByText('Yes')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Yes'));

        const file = new File(["photo"], "photo.jpg", { type: "image/jpeg" });
        fireEvent.change(screen.getByLabelText("Upload Photo"), { 
            target: { files: [file] },
        });

        fireEvent.click(screen.getByText("CREATE PRODUCT"));

        const expectedFormData = {
            name: "Product Name",
            description: "Product Description",
            price: "100",
            quantity: "10",
            photo: {
                name: "photo.jpg",
                type: "image/jpeg",
            },
            category: "1",
            shipping: "true",
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
    
        const actualFormData = axios.post.mock.calls[0][1];
        expect(formDataToObject(actualFormData)).toEqual(expectedFormData);
    });

    test("shows error message when fails to create product", async () => {
        axios.post.mockResolvedValueOnce({ 
            data: { 
                success: false,
                message: "Failed to create product",
            } 
        });

        await act(async () => {
            render(
                <MemoryRouter initialEntries={["/admin/create-product"]}>
                    <Routes>
                        <Route path="/admin/create-product" element={<CreateProduct />} />
                    </Routes>
                </MemoryRouter>
            );
        });

        fireEvent.change(screen.getByPlaceholderText("write a name"), {
            target: { value: "Product Name" },
        });
        fireEvent.change(screen.getByPlaceholderText("write a description"), {
            target: { value: "Product Description" },
        });
        fireEvent.change(screen.getByPlaceholderText("write a Price"), {
            target: { value: 100 },
        });
        fireEvent.change(screen.getByPlaceholderText("write a quantity"), {
            target: { value: 10 },
        });

        const categoryDropdown = screen.getAllByRole("combobox")[0];
        fireEvent.mouseDown(categoryDropdown);
        await waitFor(() => expect(screen.getByText('category1')).toBeInTheDocument());
        fireEvent.click(screen.getByText('category1'));

        const shippingDropdown = screen.getAllByRole("combobox")[1];
        fireEvent.mouseDown(shippingDropdown);
        await waitFor(() => expect(screen.getByText('Yes')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Yes'));
        
        const file = new File(["photo"], "photo.jpg", { type: "image/jpeg" });
        fireEvent.change(screen.getByLabelText("Upload Photo"), { 
            target: { files: [file] },
        });

        fireEvent.click(screen.getByText("CREATE PRODUCT"));

        await waitFor(() => expect(axios.post).toHaveBeenCalled());
        expect(toast.error).toHaveBeenCalled();
    });

    // Decision table testing for missing inputs into the form
    test("fails to create product when name is empty", async () => {
        await act(async () => {
            render(
                <MemoryRouter initialEntries={["/admin/create-product"]}>
                    <Routes>
                        <Route path="/admin/create-product" element={<CreateProduct />} />
                    </Routes>
                </MemoryRouter>
            );
        });

        fireEvent.change(screen.getByPlaceholderText("write a description"), {
            target: { value: "Product Description" },
        });
        fireEvent.change(screen.getByPlaceholderText("write a Price"), {
            target: { value: 100 },
        });
        fireEvent.change(screen.getByPlaceholderText("write a quantity"), {
            target: { value: 10 },
        });

        const categoryDropdown = screen.getAllByRole("combobox")[0];
        fireEvent.mouseDown(categoryDropdown);
        await waitFor(() => expect(screen.getByText('category1')).toBeInTheDocument());
        fireEvent.click(screen.getByText('category1'));

        const shippingDropdown = screen.getAllByRole("combobox")[1];
        fireEvent.mouseDown(shippingDropdown);
        await waitFor(() => expect(screen.getByText('Yes')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Yes'));
        
        const file = new File(["photo"], "photo.jpg", { type: "image/jpeg" });
        fireEvent.change(screen.getByLabelText("Upload Photo"), { 
            target: { files: [file] },
        });

        fireEvent.click(screen.getByText("CREATE PRODUCT"));

        expect(axios.post).not.toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalled();
    });

    test("fails to create product when photo is empty", async () => {
        await act(async () => {
            render(
                <MemoryRouter initialEntries={["/admin/create-product"]}>
                    <Routes>
                        <Route path="/admin/create-product" element={<CreateProduct />} />
                    </Routes>
                </MemoryRouter>
            );
        });

        fireEvent.change(screen.getByPlaceholderText("write a name"), {
            target: { value: "Product Name" },
        });
        fireEvent.change(screen.getByPlaceholderText("write a description"), {
            target: { value: "Product Description" },
        });
        fireEvent.change(screen.getByPlaceholderText("write a Price"), {
            target: { value: 100 },
        });
        fireEvent.change(screen.getByPlaceholderText("write a quantity"), {
            target: { value: 10 },
        });

        const categoryDropdown = screen.getAllByRole("combobox")[0];
        fireEvent.mouseDown(categoryDropdown);
        await waitFor(() => expect(screen.getByText('category1')).toBeInTheDocument());
        fireEvent.click(screen.getByText('category1'));

        const shippingDropdown = screen.getAllByRole("combobox")[1];
        fireEvent.mouseDown(shippingDropdown);
        await waitFor(() => expect(screen.getByText('Yes')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Yes'));

        fireEvent.click(screen.getByText("CREATE PRODUCT"));

        expect(axios.post).not.toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalled();
    });

    test("fails to create product when category is empty", async () => {
        await act(async () => {
            render(
                <MemoryRouter initialEntries={["/admin/create-product"]}>
                    <Routes>
                        <Route path="/admin/create-product" element={<CreateProduct />} />
                    </Routes>
                </MemoryRouter>
            );
        });

        fireEvent.change(screen.getByPlaceholderText("write a name"), {
            target: { value: "Product Name" },
        });
        fireEvent.change(screen.getByPlaceholderText("write a description"), {
            target: { value: "Product Description" },
        });
        fireEvent.change(screen.getByPlaceholderText("write a Price"), {
            target: { value: 100 },
        });
        fireEvent.change(screen.getByPlaceholderText("write a quantity"), {
            target: { value: 10 },
        });

        const shippingDropdown = screen.getAllByRole("combobox")[1];
        fireEvent.mouseDown(shippingDropdown);
        await waitFor(() => expect(screen.getByText('Yes')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Yes'));
        
        const file = new File(["photo"], "photo.jpg", { type: "image/jpeg" });
        fireEvent.change(screen.getByLabelText("Upload Photo"), { 
            target: { files: [file] },
        });

        fireEvent.click(screen.getByText("CREATE PRODUCT"));

        expect(axios.post).not.toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalled();
    });

    test("fails to create product when description is empty", async () => {
        await act(async () => {
            render(
                <MemoryRouter initialEntries={["/admin/create-product"]}>
                    <Routes>
                        <Route path="/admin/create-product" element={<CreateProduct />} />
                    </Routes>
                </MemoryRouter>
            );
        });

        fireEvent.change(screen.getByPlaceholderText("write a name"), {
            target: { value: "Product Name" },
        });
        fireEvent.change(screen.getByPlaceholderText("write a Price"), {
            target: { value: 100 },
        });
        fireEvent.change(screen.getByPlaceholderText("write a quantity"), {
            target: { value: 10 },
        });

        const categoryDropdown = screen.getAllByRole("combobox")[0];
        fireEvent.mouseDown(categoryDropdown);
        await waitFor(() => expect(screen.getByText('category1')).toBeInTheDocument());
        fireEvent.click(screen.getByText('category1'));

        const shippingDropdown = screen.getAllByRole("combobox")[1];
        fireEvent.mouseDown(shippingDropdown);
        await waitFor(() => expect(screen.getByText('Yes')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Yes'));
        
        const file = new File(["photo"], "photo.jpg", { type: "image/jpeg" });
        fireEvent.change(screen.getByLabelText("Upload Photo"), { 
            target: { files: [file] },
        });

        fireEvent.click(screen.getByText("CREATE PRODUCT"));

        expect(axios.post).not.toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalled();
    });

    test("fails to create product when price is empty", async () => {
        await act(async () => {
            render(
                <MemoryRouter initialEntries={["/admin/create-product"]}>
                    <Routes>
                        <Route path="/admin/create-product" element={<CreateProduct />} />
                    </Routes>
                </MemoryRouter>
            );
        });

        fireEvent.change(screen.getByPlaceholderText("write a name"), {
            target: { value: "Product Name" },
        });
        fireEvent.change(screen.getByPlaceholderText("write a description"), {
            target: { value: "Product Description" },
        });
        fireEvent.change(screen.getByPlaceholderText("write a quantity"), {
            target: { value: 10 },
        });

        const categoryDropdown = screen.getAllByRole("combobox")[0];
        fireEvent.mouseDown(categoryDropdown);
        await waitFor(() => expect(screen.getByText('category1')).toBeInTheDocument());
        fireEvent.click(screen.getByText('category1'));

        const shippingDropdown = screen.getAllByRole("combobox")[1];
        fireEvent.mouseDown(shippingDropdown);
        await waitFor(() => expect(screen.getByText('Yes')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Yes'));
        
        const file = new File(["photo"], "photo.jpg", { type: "image/jpeg" });
        fireEvent.change(screen.getByLabelText("Upload Photo"), { 
            target: { files: [file] },
        });

        fireEvent.click(screen.getByText("CREATE PRODUCT"));

        expect(axios.post).not.toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalled();
    });

    test("fails to create product when quantity is empty", async () => {
        await act(async () => {
            render(
                <MemoryRouter initialEntries={["/admin/create-product"]}>
                    <Routes>
                        <Route path="/admin/create-product" element={<CreateProduct />} />
                    </Routes>
                </MemoryRouter>
            );
        });

        fireEvent.change(screen.getByPlaceholderText("write a name"), {
            target: { value: "Product Name" },
        });
        fireEvent.change(screen.getByPlaceholderText("write a description"), {
            target: { value: "Product Description" },
        });
        fireEvent.change(screen.getByPlaceholderText("write a Price"), {
            target: { value: 100 },
        });

        const categoryDropdown = screen.getAllByRole("combobox")[0];
        fireEvent.mouseDown(categoryDropdown);
        await waitFor(() => expect(screen.getByText('category1')).toBeInTheDocument());
        fireEvent.click(screen.getByText('category1'));

        const shippingDropdown = screen.getAllByRole("combobox")[1];
        fireEvent.mouseDown(shippingDropdown);
        await waitFor(() => expect(screen.getByText('Yes')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Yes'));
        
        const file = new File(["photo"], "photo.jpg", { type: "image/jpeg" });
        fireEvent.change(screen.getByLabelText("Upload Photo"), { 
            target: { files: [file] },
        });

        fireEvent.click(screen.getByText("CREATE PRODUCT"));

        expect(axios.post).not.toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalled();
    });

    test("fails to create product when shipping is empty", async () => {
        await act(async () => {
            render(
                <MemoryRouter initialEntries={["/admin/create-product"]}>
                    <Routes>
                        <Route path="/admin/create-product" element={<CreateProduct />} />
                    </Routes>
                </MemoryRouter>
            );
        });

        fireEvent.change(screen.getByPlaceholderText("write a name"), {
            target: { value: "Product Name" },
        });
        fireEvent.change(screen.getByPlaceholderText("write a description"), {
            target: { value: "Product Description" },
        });
        fireEvent.change(screen.getByPlaceholderText("write a Price"), {
            target: { value: 100 },
        });
        fireEvent.change(screen.getByPlaceholderText("write a quantity"), {
            target: { value: 10 },
        });

        const categoryDropdown = screen.getAllByRole("combobox")[0];
        fireEvent.mouseDown(categoryDropdown);
        await waitFor(() => expect(screen.getByText('category1')).toBeInTheDocument());
        fireEvent.click(screen.getByText('category1'));
        
        const file = new File(["photo"], "photo.jpg", { type: "image/jpeg" });
        fireEvent.change(screen.getByLabelText("Upload Photo"), { 
            target: { files: [file] },
        });

        fireEvent.click(screen.getByText("CREATE PRODUCT"));

        expect(axios.post).not.toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalled();
    });

    test("fails to create product when price is less than or equal to 0", async () => {
        await act(async () => {
            render(
                <MemoryRouter initialEntries={["/admin/create-product"]}>
                    <Routes>
                        <Route path="/admin/create-product" element={<CreateProduct />} />
                    </Routes>
                </MemoryRouter>
            );
        });

        fireEvent.change(screen.getByPlaceholderText("write a name"), {
            target: { value: "Product Name" },
        });
        fireEvent.change(screen.getByPlaceholderText("write a description"), {
            target: { value: "Product Description" },
        });
        fireEvent.change(screen.getByPlaceholderText("write a Price"), {
            target: { value: -5 },
        });
        fireEvent.change(screen.getByPlaceholderText("write a quantity"), {
            target: { value: 10 },
        });

        const categoryDropdown = screen.getAllByRole("combobox")[0];
        fireEvent.mouseDown(categoryDropdown);
        await waitFor(() => expect(screen.getByText('category1')).toBeInTheDocument());
        fireEvent.click(screen.getByText('category1'));

        const shippingDropdown = screen.getAllByRole("combobox")[1];
        fireEvent.mouseDown(shippingDropdown);
        await waitFor(() => expect(screen.getByText('Yes')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Yes'));
        
        const file = new File(["photo"], "photo.jpg", { type: "image/jpeg" });
        fireEvent.change(screen.getByLabelText("Upload Photo"), { 
            target: { files: [file] },
        });

        fireEvent.click(screen.getByText("CREATE PRODUCT"));

        expect(axios.post).not.toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalled();
    });

    test("fails to create product when quantity is less than or equal to 0", async () => {
        await act(async () => {
            render(
                <MemoryRouter initialEntries={["/admin/create-product"]}>
                    <Routes>
                        <Route path="/admin/create-product" element={<CreateProduct />} />
                    </Routes>
                </MemoryRouter>
            );
        });

        fireEvent.change(screen.getByPlaceholderText("write a name"), {
            target: { value: "Product Name" },
        });
        fireEvent.change(screen.getByPlaceholderText("write a description"), {
            target: { value: "Product Description" },
        });
        fireEvent.change(screen.getByPlaceholderText("write a Price"), {
            target: { value: 100 },
        });
        fireEvent.change(screen.getByPlaceholderText("write a quantity"), {
            target: { value: -5 },
        });

        const categoryDropdown = screen.getAllByRole("combobox")[0];
        fireEvent.mouseDown(categoryDropdown);
        await waitFor(() => expect(screen.getByText('category1')).toBeInTheDocument());
        fireEvent.click(screen.getByText('category1'));

        const shippingDropdown = screen.getAllByRole("combobox")[1];
        fireEvent.mouseDown(shippingDropdown);
        await waitFor(() => expect(screen.getByText('Yes')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Yes'));
        
        const file = new File(["photo"], "photo.jpg", { type: "image/jpeg" });
        fireEvent.change(screen.getByLabelText("Upload Photo"), { 
            target: { files: [file] },
        });

        fireEvent.click(screen.getByText("CREATE PRODUCT"));

        expect(axios.post).not.toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalled();
    });

    test("error when getting categories", async () => {
        axios.get.mockReset();
        axios.get.mockRejectedValueOnce(new Error("Network Error"));

        await act(async () => {
            render(
                <MemoryRouter initialEntries={["/admin/create-product"]}>
                    <Routes>
                        <Route path="/admin/create-product" element={<CreateProduct />} />
                    </Routes>
                </MemoryRouter>
            );
        });

        expect(axios.get).toHaveBeenCalled();
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalled();
        });
    });

    test("failure when getting categories", async () => {
        axios.get.mockReset();
        axios.get.mockResolvedValueOnce({
            data: { success: false },
        });

        await act(async () => {
            render(
                <MemoryRouter initialEntries={["/admin/create-product"]}>
                    <Routes>
                        <Route path="/admin/create-product" element={<CreateProduct />} />
                    </Routes>
                </MemoryRouter>
            );
        });

        expect(axios.get).toHaveBeenCalled();
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalled();
        });
    });

    test("error when creating product", async () => {
        axios.post.mockRejectedValueOnce(new Error("Network Error"));

        await act(async () => {
            render(
                <MemoryRouter initialEntries={["/admin/create-product"]}>
                    <Routes>
                        <Route path="/admin/create-product" element={<CreateProduct />} />
                    </Routes>
                </MemoryRouter>
            );
        });

        fireEvent.change(screen.getByPlaceholderText("write a name"), {
            target: { value: "Product Name" },
        });
        fireEvent.change(screen.getByPlaceholderText("write a description"), {
            target: { value: "Product Description" },
        });
        fireEvent.change(screen.getByPlaceholderText("write a Price"), {
            target: { value: 100 },
        });
        fireEvent.change(screen.getByPlaceholderText("write a quantity"), {
            target: { value: 10 },
        });

        const categoryDropdown = screen.getAllByRole("combobox")[0];
        fireEvent.mouseDown(categoryDropdown);
        await waitFor(() => expect(screen.getByText('category1')).toBeInTheDocument());
        fireEvent.click(screen.getByText('category1'));

        const shippingDropdown = screen.getAllByRole("combobox")[1];
        fireEvent.mouseDown(shippingDropdown);
        await waitFor(() => expect(screen.getByText('Yes')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Yes'));
        
        const file = new File(["photo"], "photo.jpg", { type: "image/jpeg" });
        fireEvent.change(screen.getByLabelText("Upload Photo"), { 
            target: { files: [file] },
        });

        fireEvent.click(screen.getByText("CREATE PRODUCT"));

        await waitFor(() => expect(axios.post).toHaveBeenCalled());
        expect(toast.error).toHaveBeenCalled();
    });
});