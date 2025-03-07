import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import axios from "axios";
import CreateCategory from "./CreateCategory";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import { describe } from "node:test";

jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../../components/Layout", () => ({ children }) => (
    <div data-testid="layout">{children}</div>
));

jest.mock("../../components/AdminMenu", () => () => <div data-testid="admin-menu" />);

describe("CreateCategory Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        axios.mockReset();
    });

    describe("Getting and displaying categories", () => {
        test("correctly populates all categories", async () => {
            axios.get.mockResolvedValueOnce({
                data: {
                    success: true,
                    category: [
                        { _id: "1", name: "Electronics" },
                        { _id: "2", name: "Clothing" },
                    ],
                },
            });

            await act(async () => {
                render(
                    <CreateCategory />
                );
            });

            expect(screen.getByText("Electronics")).toBeInTheDocument();
            expect(screen.getByText("Clothing")).toBeInTheDocument();
        });

        test("failed in getting categories", async () => {
            axios.get.mockResolvedValueOnce({
                data: { success: false }
            });

            await act(async () => {
                render(
                    <CreateCategory />
                );
            });

            expect(toast.error).toHaveBeenCalledWith("Failed to get categories");
        });

        test("error when getting categories", async () => {
            axios.get.mockRejectedValueOnce(new Error("Network error"));

            await act(async () => {
                render(
                    <CreateCategory />
                );
            });

            expect(toast.error).toHaveBeenCalledWith("Something went wrong in getting category");
        });
    });

    describe("Creating categories", () => {
        test("handles category creation successfully", async () => {
            axios.get.mockResolvedValue({
                data: { success: true, category: [{ _id: "2", name: "Clothing" }] },
            });

            axios.post.mockResolvedValueOnce({
                data: { success: true, message: "Category created" },
            });

            await act(async () => {
                render(
                    <CreateCategory />
                );
            });

            await act(async () => {
                fireEvent.change(screen.getByPlaceholderText("Enter new category"), {
                    target: { value: "Clothing" },
                });
                fireEvent.click(screen.getByText("Submit"));
            });

            await waitFor(() => expect(axios.post).toHaveBeenCalledWith(
                "/api/v1/category/create-category",
                { name: "Clothing" }
            ));
            expect(toast.success).toHaveBeenCalledWith("Clothing is created");
        });

        test("handles category creation failure", async () => {
            axios.post.mockResolvedValueOnce({
                data: { success: false, message: "Category already exists" },
            });

            await act(async () => {
                render(
                    <CreateCategory />
                );
            });

            await act(async () => {
                fireEvent.change(screen.getByPlaceholderText("Enter new category"), {
                    target: { value: "Clothing" },
                });
                fireEvent.click(screen.getByText("Submit"));
            });

            expect(toast.error).toHaveBeenCalledWith("Category already exists");
        });

        test("error when creating category", async () => {
            axios.post.mockRejectedValueOnce(new Error("Network error"));

            await act(async () => {
                render(
                    <CreateCategory />
                );
            });

            await act(async () => {
                fireEvent.change(screen.getByPlaceholderText("Enter new category"), {
                    target: { value: "Clothing" },
                });
                fireEvent.click(screen.getByText("Submit"));
            });

            expect(toast.error).toHaveBeenCalledWith("something went wrong in input form");
        });
    });

    describe("Updating categories", () => {
        test("handles category update successfully", async () => {
            axios.get.mockResolvedValueOnce({
                data: {
                    success: true,
                    category: [
                        { _id: "1", name: "Electronics" },
                        { _id: "2", name: "Clothing" },
                    ],
                },
            });

            axios.put.mockResolvedValueOnce({
                data: { success: true, message: "Category updated" },
            });

            await act(async () => {
                render(
                    <CreateCategory />
                );
            });

            await act(async () => {
                fireEvent.click(screen.getAllByRole("button", { name: /edit/i })[0]);
            });

            const modal = screen.getByRole("dialog");
            expect(modal).toHaveStyle("display: block;");

            await act(async () => {
                fireEvent.change(screen.getByDisplayValue("Electronics"), {
                    target: { value: "Updated Name" },
                });

                fireEvent.click(screen.getAllByText("Submit")[1]);
            });

            expect(modal).toHaveStyle("display: none;");
            await waitFor(() => expect(axios.put).toHaveBeenCalledWith(
                "/api/v1/category/update-category/1",
                { name: "Updated Name" }
            ));
            expect(toast.success).toHaveBeenCalledWith("Updated Name is updated");
        });

        test("cancels category update", async () => {
            axios.get.mockResolvedValueOnce({
                data: {
                    success: true,
                    category: [
                        { _id: "1", name: "Electronics" },
                        { _id: "2", name: "Clothing" },
                    ],
                },
            });

            await act(async () => {
                render(
                    <CreateCategory />
                );
            });

            await act(async () => {
                fireEvent.click(screen.getAllByRole("button", { name: /edit/i })[0]);
            });

            const modal = screen.getByRole("dialog");
            expect(modal).toHaveStyle("display: block;");

            await act(async () => {
                fireEvent.click(screen.getByRole("button", { name: "Close" }));
            });

            expect(modal).toHaveStyle("display: none;");
        });

        test("handles category update failure", async () => {
            axios.get.mockResolvedValueOnce({
                data: {
                    success: true,
                    category: [
                        { _id: "1", name: "Electronics" },
                        { _id: "2", name: "Clothing" },
                    ],
                },
            });

            axios.put.mockResolvedValueOnce({
                data: { success: false, message: "Category not found" },
            });

            await act(async () => {
                render(
                    <CreateCategory />
                );
            });

            await act(async () => {
                fireEvent.click(screen.getAllByRole("button", { name: /edit/i })[0]);
            });

            const modal = screen.getByRole("dialog");
            expect(modal).toHaveStyle("display: block;");

            await act(async () => {
                fireEvent.change(screen.getByDisplayValue("Electronics"), {
                    target: { value: "Updated Name" },
                });

                fireEvent.click(screen.getAllByText("Submit")[1]);
            });

            expect(toast.error).toHaveBeenCalledWith("Category not found");
        });

        test("error when updating category", async () => {
            axios.get.mockResolvedValueOnce({
                data: {
                    success: true,
                    category: [
                        { _id: "1", name: "Electronics" },
                        { _id: "2", name: "Clothing" },
                    ],
                },
            });

            axios.put.mockRejectedValueOnce(new Error("Network error"));

            await act(async () => {
                render(
                    <CreateCategory />
                );
            });

            await act(async () => {
                fireEvent.click(screen.getAllByRole("button", { name: /edit/i })[0]);
            });

            const modal = screen.getByRole("dialog");
            expect(modal).toBeInTheDocument();

            await act(async () => {
                fireEvent.change(screen.getByDisplayValue("Electronics"), {
                    target: { value: "Updated Name" },
                });

                fireEvent.click(screen.getAllByText("Submit")[1]);
            });

            expect(toast.error).toHaveBeenCalledWith("Something went wrong");
        });
    });

    describe("Deleting categories", () => {
        test("handles category deletion successfully", async () => {
            axios.get.mockResolvedValue({
                data: { success: true, category: [{ _id: "1", name: "Clothing" }] },
            });

            axios.delete.mockResolvedValueOnce({
                data: { success: true, message: "Category deleted" },
            });

            await act(async () => {
                render(
                    <CreateCategory />
                );
            });

            await act(async () => {
                fireEvent.click(screen.getAllByText("Delete")[0]);
            });

            await waitFor(() => expect(axios.delete).toHaveBeenCalledWith(
                "/api/v1/category/delete-category/1"
            ));
            expect(toast.success).toHaveBeenCalledWith("category is deleted");
        });

        test("handles category deletion failure", async () => {
            axios.get.mockResolvedValue({
                data: { success: true, category: [{ _id: "1", name: "Clothing" }] },
            });

            axios.delete.mockResolvedValueOnce({
                data: { success: false, message: "Category not found" },
            });

            await act(async () => {
                render(
                    <CreateCategory />
                );
            });

            await act(async () => {
                fireEvent.click(screen.getAllByText("Delete")[0]);
            });

            expect(toast.error).toHaveBeenCalledWith("Category not found");
        });

        test("error when deleting category", async () => {
            axios.get.mockResolvedValue({
                data: { success: true, category: [{ _id: "1", name: "Clothing" }] },
            });

            axios.delete.mockRejectedValueOnce(new Error("Network error"));

            await act(async () => {
                render(
                    <CreateCategory />
                );
            });

            await act(async () => {
                fireEvent.click(screen.getAllByText("Delete")[0]);
            });

            expect(toast.error).toHaveBeenCalledWith("Something went wrong");
        });
    });
});