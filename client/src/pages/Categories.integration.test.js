import React from "react";
import { render, fireEvent, waitFor, act, within } from "@testing-library/react";
import axios from "axios";
import "@testing-library/jest-dom/extend-expect";
import Categories from "./Categories";
import { screen } from "@testing-library/dom";
import { MemoryRouter } from "react-router-dom";

axios.defaults.baseURL = 'http://localhost:6060';


jest.mock("../components/Layout", () => ({ children }) => (
    <div data-testid="layout">{children}</div>
));

describe("Categories Page", () => {
    beforeEach(async () => {
        jest.clearAllMocks();

    });

    it("renders categories fetched from API", async () => {
        await act(async () => {
            render(
                <MemoryRouter>
                    <Categories />
                </MemoryRouter>
            );
        });

        await waitFor(() => {
            expect(screen.getByText("Electronics")).toBeInTheDocument();
            expect(screen.getByText("Book")).toBeInTheDocument();
            expect(screen.getByText("Clothing")).toBeInTheDocument();
        });
    });
});