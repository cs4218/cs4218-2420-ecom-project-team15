import React from 'react'
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Users from "./Users";

jest.mock("../../components/Layout", () => ({ children }) => (
    <div data-testid="layout">{children}</div>
));

jest.mock("../../components/AdminMenu", () => () => <div data-testid="admin-menu"/>);

describe("Users Component", () => {
    beforeEach(() => {
        render(<Users />);
    });

    test("renders Layout component with correct title", () => {
        expect(screen.getByTestId("layout")).toBeInTheDocument();
    });

    test("renders AdminMenu inside sidebar", () => {
        expect(screen.getByTestId("admin-menu")).toBeInTheDocument();
    });

    test("displays 'All Users' heading", () => {
        expect(screen.getByRole("heading", { level: 1, name: /all users/i })).toBeInTheDocument();
    });
});
