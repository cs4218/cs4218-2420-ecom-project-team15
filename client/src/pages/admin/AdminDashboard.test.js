import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import "@testing-library/jest-dom/extend-expect";

jest.mock("../../context/auth", () => ({
    useAuth: jest.fn(() => [
        { user: { name: "John Doe", email: "test@example.com", phone: "12345678" } },
        jest.fn()
    ]), // Mock useAuth hook to return a user object and a mock function for setAuth
})); 

jest.mock("../../context/cart", () => ({
    useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../../context/search", () => ({
    useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

describe("AdminDashboard Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders admin dashboard with correct name, email and contact", () => {
        const { getByText } = render(
            <MemoryRouter initialEntries={["/admin"]}>
                <Routes>
                    <Route path="/admin" element={<AdminDashboard />} />
                </Routes>
            </MemoryRouter>
        );

        expect(getByText("Admin Name : John Doe")).toBeInTheDocument();
        expect(getByText("Admin Email : test@example.com")).toBeInTheDocument();
        expect(getByText("Admin Contact : 12345678")).toBeInTheDocument();
    });
});
