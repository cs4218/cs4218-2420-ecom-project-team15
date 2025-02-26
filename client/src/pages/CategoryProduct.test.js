import React from "react";
import { render, act, fireEvent } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import axios from "axios";
import { MemoryRouter, Routes, Route, useParams } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import CategoryProduct from "./CategoryProduct";

jest.mock("axios");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useParams: jest.fn(),
    useNavigate: () => mockNavigate,
}));

jest.mock("../components/Layout", () => ({ children }) => (
    <div data-testid="layout">{children}</div>
));

describe("CategoryProduct Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useParams.mockReturnValue({ slug: "electronics" });
        axios.get.mockReset();
        axios.get.mockResolvedValueOnce({
            data: {
                products: [
                    { _id: "1", name: "product1", price: 1, description: "description1", slug: "product1" },
                    { _id: "2", name: "product2", price: 2, description: "description2", slug: "product2" },
                    { _id: "3", name: "product3", price: 3, description: "description3", slug: "product3" }
                ],
                category: { name: "electronics" }
            },
        });
    });

    test("all products are correctly populated", async () => {
        await act(async () => {
            render(
                <MemoryRouter initialEntries={["/category/electronics"]}>
                    <Routes>
                        <Route path="/category/electronics" element={<CategoryProduct />} />
                    </Routes>
                </MemoryRouter>
            );
        });

        expect(axios.get).toHaveBeenCalledWith("/api/v1/product/product-category/electronics");
        expect(screen.getByText("3 result found")).toBeInTheDocument();
        expect(screen.getAllByText("product1")).toHaveLength(1);
        expect(screen.getAllByText("product2")).toHaveLength(1);
        expect(screen.getAllByText("product3")).toHaveLength(1);
    });

    test("product details are correctly rendered", async () => {
        await act(async () => {
            render(
                <MemoryRouter initialEntries={["/category/electronics"]}>
                    <Routes>
                        <Route path="/category/electronics" element={<CategoryProduct />} />
                    </Routes>
                </MemoryRouter>
            );
        });

        expect(axios.get).toHaveBeenCalledWith("/api/v1/product/product-category/electronics");
        expect(screen.getAllByText("description1...")).toHaveLength(1);
        expect(screen.getAllByText("description2...")).toHaveLength(1);
        expect(screen.getAllByText("description3...")).toHaveLength(1);
        expect(screen.getAllByText("$1.00")).toHaveLength(1);
        expect(screen.getAllByText("$2.00")).toHaveLength(1);
        expect(screen.getAllByText("$3.00")).toHaveLength(1);
        const images = screen.getAllByRole("img");
        expect(images.length).toBe(3);
        expect(images[0]).toHaveAttribute("src", "/api/v1/product/product-photo/1");
        expect(images[0]).toHaveAttribute("alt", "product1");
        expect(images[1]).toHaveAttribute("src", "/api/v1/product/product-photo/2");
        expect(images[1]).toHaveAttribute("alt", "product2");
        expect(images[2]).toHaveAttribute("src", "/api/v1/product/product-photo/3");
        expect(images[2]).toHaveAttribute("alt", "product3");
    });

    test("category is correctly retrieved", async () => {
        await act(async () => {
            render(
                <MemoryRouter initialEntries={["/category/electronics"]}>
                    <Routes>   
                        <Route path="/category/:slug" element={<CategoryProduct />} />
                    </Routes>
                </MemoryRouter>
            );
        });

        expect(axios.get).toHaveBeenCalledWith("/api/v1/product/product-category/electronics");
        expect(screen.getByText("Category - electronics")).toBeInTheDocument();
    });

    test("error when getting products by category", async () => {
        const mockError = new Error("Network Error");
        axios.get.mockReset();
        axios.get.mockRejectedValueOnce(mockError);
        const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});

        await act(async () => {
            render(
                <MemoryRouter initialEntries={["/category/electronics"]}>
                    <Routes>
                        <Route path="/category/:slug" element={<CategoryProduct />} />
                    </Routes>
                </MemoryRouter>
            );
        });

        expect(consoleLogSpy).toHaveBeenCalledWith(mockError);
    });

    test("no slug provided", async () => {
        useParams.mockReset();
        await act(async () => {
            render(
                <MemoryRouter initialEntries={["/category/electronics"]}>
                    <Routes>
                        <Route path="/category/:slug" element={<CategoryProduct />} />
                    </Routes>
                </MemoryRouter>
            );
        });

        expect(axios.get).not.toHaveBeenCalled();
    });

    test("should navigate to product details page", async () => {
        await act(async () => {
            render(
                <MemoryRouter initialEntries={["/category/electronics"]}>
                    <Routes>
                        <Route path="/category/:slug" element={<CategoryProduct />} />
                    </Routes>
                </MemoryRouter>
            );
        });

        const detailsButton = screen.getAllByRole("button", { name: /more details/i })[0];
        fireEvent.click(detailsButton);
        expect(mockNavigate).toHaveBeenCalledWith("/product/product1");
    });
});