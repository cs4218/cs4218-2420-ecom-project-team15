import React from "react";
import { render } from "@testing-library/react";
import AdminMenu from "./AdminMenu";
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import "@testing-library/jest-dom/extend-expect";

describe("Dashboard Component", () => {
  it("should render with the create category, create product, products and orders navlinks", () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={["/dashboard/admin"]}>
        <Routes>
          <Route path="/dashboard/admin" element={<AdminMenu />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Check if navlink texts are correct
    expect(getByText("Admin Panel")).toBeInTheDocument();
    expect(getByText("Create Category")).toBeInTheDocument();
    expect(getByText("Create Product")).toBeInTheDocument();
    expect(getByText("Products")).toBeInTheDocument();
    expect(getByText("Orders")).toBeInTheDocument();

    // Check if navlink routes correctly
    expect(getByText("Create Category").closest('a')).toHaveAttribute('href', '/dashboard/admin/create-category');
    expect(getByText("Create Product").closest('a')).toHaveAttribute('href', '/dashboard/admin/create-product');
    expect(getByText("Products").closest('a')).toHaveAttribute('href', '/dashboard/admin/products');
    expect(getByText("Orders").closest('a')).toHaveAttribute('href', '/dashboard/admin/orders');
  });
});
