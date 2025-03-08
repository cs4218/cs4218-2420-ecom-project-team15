import React from "react";
import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { SearchProvider, useSearch } from "../context/search";
import "@testing-library/jest-dom/extend-expect";

jest.mock("axios");

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

describe("SearchProvider and useSearch Hook", () => {
  it("provides default values on initialization", async () => {
    let contextValue;

    function TestComponent() {
      contextValue = useSearch();
      return null;
    }
    await act(async () => {
      render(
        <SearchProvider>
          <TestComponent />
        </SearchProvider>
      );
    });
    expect(contextValue[0]).toEqual({ keyword: "", results: [] });
    expect(typeof contextValue[1]).toBe("function");
  });

  it("allows state updates", async () => {
    let contextValue, setContextValue;

    function TestComponent() {
      [contextValue, setContextValue] = useSearch();
      return null;
    }
    await act(async () => {
      render(
        <SearchProvider>
          <TestComponent />
        </SearchProvider>
      );
    });

    act(() => {
      setContextValue({ keyword: "Laptop", results: [{ id: 1, name: "MacBook" }] });
    });

    expect(contextValue).toEqual({ keyword: "Laptop", results: [{ id: 1, name: "MacBook" }] });
  });

  it("allows multiple components to consume the context", async () => {
    function ComponentA() {
      const [search, setSearch] = useSearch();
      return (
        <button onClick={() => setSearch({ keyword: "Phone", results: [{ id: 2, name: "iPhone" }] })}>Update</button>
      );
    }

    function ComponentB() {
      const [search] = useSearch();
      return <p>{search.keyword ? `Searching for: ${search.keyword}` : "No Search Term"}</p>;
    }
    await act(async () => {
      render(
        <SearchProvider>
          <ComponentA />
          <ComponentB />
        </SearchProvider>
      );
    });

    expect(screen.getByText("No Search Term")).toBeInTheDocument();

    act(() => {
      screen.getByRole("button", { name: /update/i }).click();
    });

    expect(screen.getByText("Searching for: Phone")).toBeInTheDocument();
  });

  it("throws an error when useSearch is used outside SearchProvider", () => {
    function TestComponent() {
      useSearch(); // Should throw an error
      return null;
    }

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useSearch must be used within a SearchProvider");
  });
});

