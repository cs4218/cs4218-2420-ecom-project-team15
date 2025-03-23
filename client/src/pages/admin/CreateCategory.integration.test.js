import React from "react";
import { render, fireEvent, waitFor, act, within } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import axios from "axios";
import CreateCategory from "./CreateCategory";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";

axios.defaults.baseURL = 'http://localhost:6060';
axios.defaults.headers.common['Authorization'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2E4YmQzYzdiODBhNDc2NjFhOGUwM2YiLCJpYXQiOjE3NDI1NjQyNzUsImV4cCI6MTc0MzE2OTA3NX0.lrzkaAK5rYHG96YZhNBjNrjWnDvMSlYNna-eTdQoc1U';

jest.mock("react-hot-toast");

jest.mock("../../components/Layout", () => ({ children }) => (
    <div data-testid="layout">{children}</div>
));

jest.mock("../../components/AdminMenu", () => () => <div data-testid="admin-menu" />);

describe("CreateCategory Component", () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            render(
                <CreateCategory />
            );
        });
    });

    describe("Creating categories", () => {
        test("handles category creation successfully", async () => {
            await act(async () => {
                fireEvent.change(screen.getByPlaceholderText("Enter new category"), {
                    target: { value: "integrationTestCategory" },
                });
                fireEvent.click(screen.getByText("Submit"));
            });

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalled();
                expect(screen.getByText('integrationTestCategory')).toBeInTheDocument();
            })
        });
    })

    describe("Updating categories", () => {
        test("handles category update successfully", async () => {
            await waitFor(() => {
                expect(screen.getByText('integrationTestCategory')).toBeInTheDocument();
            })
    
            await act(async () => {
                const testCategoryRow = screen.getByText('integrationTestCategory').closest('tr');
                if (testCategoryRow) {
                    const editButton = within(testCategoryRow).getByRole('button', { name: /edit/i });
                    fireEvent.click(editButton);
                }
            });
    
            await act(async () => {
                fireEvent.change(screen.getByDisplayValue("integrationTestCategory"), {
                    target: { value: "integrationTestCategory2" },
                });
    
                fireEvent.click(screen.getAllByText("Submit")[1]);
            });
    
            await waitFor(() => {
                expect(toast.success).toHaveBeenCalled();
                expect(screen.getByText('integrationTestCategory2')).toBeInTheDocument();
                expect(screen.queryByText('integrationTestCategory')).not.toBeInTheDocument();
            })
        });
    })
    
    describe("Deleting categories", () => {
        test("handles category deletion successfully", async () => {
            await waitFor(() => {
                expect(screen.getByText('integrationTestCategory2')).toBeInTheDocument();
            })
    
            await act(async () => {
                const testCategoryRow = screen.getByText('integrationTestCategory2').closest('tr');
                if (testCategoryRow) {
                    const deleteButton = within(testCategoryRow).getByRole('button', { name: /delete/i });
                    fireEvent.click(deleteButton);
                }
            });

            await waitFor(() => {
                expect(screen.queryByText('integrationTestCategory2')).not.toBeInTheDocument();
            });
        });
    });
})

