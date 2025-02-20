import React from "react";
import { render } from "@testing-library/react";
import UserMenu from "./UserMenu";
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import "@testing-library/jest-dom/extend-expect";

describe("UserMenu Component", () => {
  it("should render with the profile and orders navlinks", () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={["/user"]}>
        <Routes>
          <Route path="/user" element={<UserMenu />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Check if navlink texts are correct
    expect(getByText("Dashboard")).toBeInTheDocument();
    expect(getByText("Profile")).toBeInTheDocument();
    expect(getByText("Orders")).toBeInTheDocument();

    // Check if navlink routes correctly
    expect(getByText("Profile").closest('a')).toHaveAttribute('href', '/dashboard/user/profile');
    expect(getByText("Orders").closest('a')).toHaveAttribute('href', '/dashboard/user/orders');
  });
});
