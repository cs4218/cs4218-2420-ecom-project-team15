import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Header from "../components/Header"; // Adjust import path
import { useAuth } from "../context/auth";
import { useCart } from "../context/cart";
import useCategory from "../hooks/useCategory";
import "@testing-library/jest-dom";

// ✅ Mock dependencies
jest.mock("../context/auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(),
}));

jest.mock("../hooks/useCategory", () => jest.fn());

jest.mock("../components/Form/SearchInput", () => () => <div data-testid="search-input-mock" />);

describe("Header Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders Virtual Vault brand logo", () => {
    useAuth.mockReturnValue([null, jest.fn()]);
    useCart.mockReturnValue([[]]);
    useCategory.mockReturnValue([]);

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    expect(screen.getByText("🛒 Virtual Vault")).toBeInTheDocument();
  });

  it("renders Home and Categories links for unauthenticated users", () => {
    useAuth.mockReturnValue([null, jest.fn()]);
    useCart.mockReturnValue([[]]);
    useCategory.mockReturnValue([]);

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Categories")).toBeInTheDocument();
    expect(screen.getByText("Home")).toHaveAttribute("href", "/");
    expect(screen.getByText("Categories")).toHaveAttribute("href", "/categories");
  });

  it("renders user name, dashboard and logout link for authenticated users", () => {
    useAuth.mockReturnValue([{ user: { name: "John Doe", role: 0 } }, jest.fn()]);
    useCart.mockReturnValue([[]]);
    useCategory.mockReturnValue([]);

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Logout")).toBeInTheDocument();
    expect(screen.queryByText("Login")).not.toBeInTheDocument();
    expect(screen.queryByText("Register")).not.toBeInTheDocument();
  });

  it("renders login and register links for non-authenticated users", () => {
    useAuth.mockReturnValue([{}, jest.fn()]);
    useCart.mockReturnValue([[]]);
    useCategory.mockReturnValue([]);

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    expect(screen.queryByTestId("username")).not.toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    expect(screen.queryByText("Logout")).not.toBeInTheDocument();
    expect(screen.queryByText("Login")).toBeInTheDocument();
    expect(screen.queryByText("Register")).toBeInTheDocument();
  });

  it("shows correct cart count", () => {
    useAuth.mockReturnValue([null, jest.fn()]);
    useCart.mockReturnValue([[{ id: 1 }, { id: 2 }, { id: 3 }]]); // 3 items in cart
    useCategory.mockReturnValue([]);

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    expect(screen.getByText("Cart")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument(); // Badge count
  });

  it("calls handleLogout when Logout is clicked", () => {
    const setAuthMock = jest.fn();
    useAuth.mockReturnValue([{ user: { name: "John Doe", role: 0 } }, setAuthMock]);
    useCart.mockReturnValue([[]]);
    useCategory.mockReturnValue([]);

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    const logoutButton = screen.getByText("Logout");
    fireEvent.click(logoutButton);

    expect(setAuthMock).toHaveBeenCalledWith({ user: null, token: "" });
    expect(localStorage.getItem("auth")).toBe(null);
  });
});
