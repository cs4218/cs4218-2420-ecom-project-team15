import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import { useSearch } from "../../context/search";
import SearchInput from "./SearchInput";
import "@testing-library/jest-dom/extend-expect";

jest.mock("axios");

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "", results: [] }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

const mockNavigate = jest.fn();
//mock to track calls
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("SearchInput Component", () => {
  let setValuesMock;

  beforeEach(() => {
    jest.clearAllMocks();
    setValuesMock = jest.fn();
    useSearch.mockReturnValue([{ keyword: "", results: [] }, setValuesMock]);
  });

  it("renders search input correctly", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <SearchInput />
        </MemoryRouter>
      );
    });

    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  it("updates state when user types in the search box", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <SearchInput />
        </MemoryRouter>
      );
    });

    const input = screen.getByPlaceholderText("Search");

    fireEvent.change(input, { target: { value: "Laptop" } });

    expect(setValuesMock).toHaveBeenCalledWith({ keyword: "Laptop", results: [] });
  });

  it("calls API on form submission and updates search results", async () => {
    axios.get.mockResolvedValue({
      data: [{ _id: "1", name: "MacBook Pro", description: "Apple laptop", price: 1200 }],
    });

    useSearch.mockReturnValue([{ keyword: "Laptop", results: [] }, setValuesMock]);

    await act(async () => {
      render(
        <MemoryRouter>
          <SearchInput />
        </MemoryRouter>
      );
    });

    const button = screen.getByRole("button", { name: /search/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/search/Laptop");
    });

    await waitFor(() => {
      expect(setValuesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          keyword: "Laptop",
          results: [{ _id: "1", name: "MacBook Pro", description: "Apple laptop", price: 1200 }],
        })
      );
    });
  });

  it("navigates to search results page after search", async () => {
    axios.get.mockResolvedValue({ data: [] });

    useSearch.mockReturnValue([{ keyword: "Phone", results: [] }, setValuesMock]);

    await act(async () => {
      render(
        <MemoryRouter>
          <SearchInput />
        </MemoryRouter>
      );
    });

    const button = screen.getByRole("button", { name: /search/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/search");
    });
  });

  it("handles API errors gracefully", async () => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    axios.get.mockRejectedValue(new Error("Network Error"));

    useSearch.mockReturnValue([{ keyword: "Tablet", results: [] }, setValuesMock]);

    await act(async () => {
      render(
        <MemoryRouter>
          <SearchInput />
        </MemoryRouter>
      );
    });

    const button = screen.getByRole("button", { name: /search/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/search/Tablet");
    });

    expect(setValuesMock).not.toHaveBeenCalledWith(expect.objectContaining({ results: expect.any(Array) }));

    await waitFor(() => {
      expect(console.log).toHaveBeenCalled();
    });

    console.log.mockRestore();
  });

  it("does not submit form if search input is empty", async () => {
    useSearch.mockReturnValue([{ keyword: "", results: [] }, setValuesMock]);

    await act(async () => {
      render(
        <MemoryRouter>
          <SearchInput />
        </MemoryRouter>
      );
    });

    const button = screen.getByRole("button", { name: /search/i });

    fireEvent.click(button);

    expect(axios.get).not.toHaveBeenCalled();

    expect(setValuesMock).not.toHaveBeenCalled();
  });
});
