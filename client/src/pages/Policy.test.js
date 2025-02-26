import React from "react";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import Policy from "./Policy";
import "@testing-library/jest-dom/extend-expect";

jest.mock("../components/Layout", () => ({ children }) => (
    <div data-testid="layout">{children}</div>
));

describe("Policy Component", () => {
    beforeEach(() => {
        render(
            <Policy />
        );
    });

    test("renders privacy policy text", () => {
        const policyTexts = screen.getAllByText("add privacy policy");
        expect(policyTexts.length).toBeGreaterThan(0);
    });

    test("renders the image with correct attributes", () => {
        const image = screen.getByRole("img", { name: /contactus/i });
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute("src", "/images/contactus.jpeg");
        expect(image).toHaveAttribute("alt", "contactus");
        expect(image).toHaveStyle({ width: "100%" });
    });

    test("renders within the Layout component", () => {
        expect(screen.getByTestId("layout")).toBeInTheDocument();
    });
});
