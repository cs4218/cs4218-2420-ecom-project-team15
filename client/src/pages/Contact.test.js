import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import Contact from "./Contact"; 

jest.mock("../components/Layout", () => ({ children }) => <div data-testid="layout">{children}</div>);

describe("Contact Component", () => {
    test("renders the Contact page correctly", () => {
        render(<Contact />);
        expect(screen.getByTestId("layout")).toBeInTheDocument();
    });

    test("displays the correct heading", () => {
        render(<Contact />);
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("CONTACT US");
    });

    test("displays the correct contact information", () => {
        render(<Contact />);

        expect(screen.getByText("For any query or info about product, feel free to call anytime. We are available 24X7.")).toBeInTheDocument();
        expect(screen.getByText("www.help@ecommerceapp.com")).toBeInTheDocument();
        expect(screen.getByText("012-3456789")).toBeInTheDocument();
        expect(screen.getByText("1800-0000-0000 (toll free)")).toBeInTheDocument();
    });

    test("checks if the contact image is rendered correctly", () => {
        render(<Contact />);
        const imgElement = screen.getByAltText("contactus");
        expect(imgElement).toBeInTheDocument();
        expect(imgElement).toHaveAttribute("src", "/images/contactus.jpeg");
        expect(imgElement).toHaveAttribute("style", "width: 100%;");
    });
});
