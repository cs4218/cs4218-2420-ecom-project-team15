import React from "react";
import axios from "axios";
import { render, screen, waitFor } from "@testing-library/react";
import { useAuth, AuthProvider } from "./auth";
import "@testing-library/jest-dom";

const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, "localStorage", { value: mockLocalStorage });

const TestComponent = () => {
  const [auth, setAuth] = useAuth();

  return (
    <div>
      <p data-testid="user">{auth.user ? auth.user.name : "No User"}</p>
      <button
        onClick={() =>
          setAuth({ user: { name: "John Doe" }, token: "test-token" })
        }
      >
        Login
      </button>
    </div>
  );
};

describe("AuthProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with default auth state", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("user")).toHaveTextContent("No User");
  });

  it("should load auth data from localStorage on mount", async () => {
    const mockAuthData = { user: { name: "Jane Doe" }, token: "mock-token" };
    localStorage.getItem.mockReturnValue(JSON.stringify(mockAuthData));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("Jane Doe");
    });

    expect(localStorage.getItem).toHaveBeenCalledWith("auth");
  });

  it("should update axios headers with token", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    screen.getByText("Login").click();

    await waitFor(() => {
      expect(axios.defaults.headers.common["Authorization"]).toBe("test-token");
    });
  });
});
