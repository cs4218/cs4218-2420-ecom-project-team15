import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Pagenotfound from "./Pagenotfound"; // Adjust the import path
import "@testing-library/jest-dom";

// Mock Layout component to avoid rendering issues
jest.mock("./../components/Layout", () => {
  return ({ children }) => <div>{children}</div>;
});

describe("Footer Component", () => {
  it("renders not found text", () => {
    render(
      <BrowserRouter>
        <Pagenotfound />
      </BrowserRouter>
    );

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Oops ! Page Not Found")).toBeInTheDocument();
  });

  it("renders go back button", () => {
    render(
      <BrowserRouter>
        <Pagenotfound />
      </BrowserRouter>
    );

    expect(screen.getByText("Go Back")).toBeInTheDocument();
  });

  it("has the go back button link to the home page", () => {
    render(
      <BrowserRouter>
        <Pagenotfound />
      </BrowserRouter>
    );

    expect(screen.getByText("Go Back")).toHaveAttribute("href", "/");
  });
});
