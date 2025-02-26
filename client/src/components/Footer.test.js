import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Footer from "./Footer"; // Adjust the import path
import "@testing-library/jest-dom";

describe("Footer Component", () => {
    it("renders footer text", () => {
        render(
            <BrowserRouter>
                <Footer />
            </BrowserRouter>
        );

        expect(screen.getByText(/All Rights Reserved/i)).toBeInTheDocument();
    });

    it("renders all navigation links", () => {
        render(
            <BrowserRouter>
                <Footer />
            </BrowserRouter>
        );

        expect(screen.getByText("About")).toBeInTheDocument();
        expect(screen.getByText("Contact")).toBeInTheDocument();
        expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
    });

    it("links point to the correct paths", () => {
        render(
            <BrowserRouter>
                <Footer />
            </BrowserRouter>
        );

        expect(screen.getByText("About")).toHaveAttribute("href", "/about");
        expect(screen.getByText("Contact")).toHaveAttribute("href", "/contact");
        expect(screen.getByText("Privacy Policy")).toHaveAttribute("href", "/policy");
    });
});
