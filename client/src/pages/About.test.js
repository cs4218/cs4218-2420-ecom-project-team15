import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import About from "../pages/About";
import "@testing-library/jest-dom/extend-expect";

jest.mock("axios");

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "", results: [] }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

jest.mock("../components/Layout", () => {
    const React = require("react");
    const { Helmet } = require("react-helmet-async");
  
    return {
      __esModule: true,
      default: jest.fn(({ children, title }) => (
        <>
          <Helmet>
            <title>{title}</title> 
          </Helmet>
          <div data-testid="mock-layout">{children}</div>
        </>
      )),
    };
  });
  

describe("About Page Component", () => {
  it("renders the About page without crashing", () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <About />
        </MemoryRouter>
      </HelmetProvider>
    );

    expect(screen.getByTestId("mock-layout")).toBeInTheDocument();
  });

  it("displays the correct title inside Helmet", async () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <About />
        </MemoryRouter>
      </HelmetProvider>
    );

    await waitFor(() => {
      expect(document.title).toBe("About us - Ecommerce app");
    });
  });

    it("renders the about page image correctly", () => {
      render(
        <HelmetProvider>
          <MemoryRouter>
            <About />
          </MemoryRouter>
        </HelmetProvider>
      );

      const aboutImage = screen.getByAltText("contactus");
      expect(aboutImage).toBeInTheDocument();
      expect(aboutImage).toHaveAttribute("src", "/images/about.jpeg");
    });

    it("renders the correct text on the About page", () => {
      render(
        <HelmetProvider>
          <MemoryRouter>
            <About />
          </MemoryRouter>
        </HelmetProvider>
      );

      expect(screen.getByText(/Welcome to Virtual Vault/i)).toBeInTheDocument();
    });
});
