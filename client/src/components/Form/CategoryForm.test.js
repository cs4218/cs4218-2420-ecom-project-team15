import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import CategoryForm from "./CategoryForm";
import "@testing-library/jest-dom/extend-expect";

describe("CategoryForm Component", () => {
    const mockHandleSubmit = jest.fn(e => e.preventDefault());
    const mockSetValue = jest.fn();

    beforeEach(() => {
        render(
            <CategoryForm
                handleSubmit={mockHandleSubmit}
                value="Test Category"
                setValue={mockSetValue}
            />
        );
    });

    test("renders input field with correct placeholder and initial value", () => {
        const inputField = screen.getByPlaceholderText("Enter new category");
        expect(inputField).toBeInTheDocument();
        expect(inputField.value).toBe("Test Category"); 
    });

    test("renders submit button", () => {
        const button = screen.getByRole("button", { name: /submit/i });
        expect(button).toBeInTheDocument();
    });

    test("calls setValue when user types in input", () => {
        const inputField = screen.getByPlaceholderText("Enter new category");
    
        fireEvent.change(inputField, { target: { value: "New Category" } });
        expect(mockSetValue).toHaveBeenCalledWith("New Category");
    });

    test("calls handleSubmit when form is submitted", () => {
        const submitButton = screen.getByRole("button", { name: /submit/i });
        fireEvent.click(submitButton);
        expect(mockHandleSubmit).toHaveBeenCalled();
    });
});
