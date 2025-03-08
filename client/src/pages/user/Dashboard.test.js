import React from "react";
import { render } from "@testing-library/react";
import Dashboard from "./Dashboard";
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import "@testing-library/jest-dom/extend-expect";

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [{
    token: "user", 
    user: {
      name: "John Doe",
      email: "test@example.com",
      address: "123 Main St",
    }
  }, jest.fn()]),
})); 

jest.mock('../../context/cart', () => ({
  useCart: jest.fn(() => [null, jest.fn()]) // Mock useCart hook to return null state and a mock function
}));

jest.mock('../../context/search', () => ({
  useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
}));  

jest.mock('../../hooks/useCategory', () => jest.fn(() => []));

describe("Dashboard Component", () => {
  it("should render the user's name, email, and address", () => {
    const { getAllByText, getByText } = render(
      <MemoryRouter initialEntries={["/user"]}>
        <Routes>
          <Route path="/user" element={<Dashboard />} />
        </Routes>
      </MemoryRouter>
    );
    
    expect(getAllByText("John Doe")[1]).toBeInTheDocument();
    expect(getByText("test@example.com")).toBeInTheDocument();
    expect(getByText("123 Main St")).toBeInTheDocument();
  });
});
