import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import ForgotPassword from "./ForgotPassword";
import { useNavigate } from "react-router-dom";
import { expect } from "@playwright/test";

jest.mock("axios");
jest.mock("react-hot-toast");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock('../../context/auth', () => ({
  useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock('../../context/cart', () => ({
useCart: jest.fn(() => [null, jest.fn()]) // Mock useCart hook to return null state and a mock function
}));
  
jest.mock('../../context/search', () => ({
useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
}));  

jest.mock('../../hooks/useCategory', () => jest.fn(() => []));

describe("ForgotPassword Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders forgot password form", () => {
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByText("FORGOT PASSWORD FORM")).toBeInTheDocument();
    expect(getByPlaceholderText("Enter Your Email")).toBeInTheDocument();
    expect(getByPlaceholderText("Enter Your Answer")).toBeInTheDocument();
    expect(getByPlaceholderText("Enter Your New Password")).toBeInTheDocument();
  });

  it("inputs should be initially empty", () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByPlaceholderText("Enter Your Email").value).toBe("");
    expect(getByPlaceholderText("Enter Your Answer").value).toBe("");
    expect(getByPlaceholderText("Enter Your New Password").value).toBe("");
  });

  it("should allow typing in input fields", () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Answer"), {
      target: { value: "my answer" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your New Password"), {
      target: { value: "newpassword" },
    });

    expect(getByPlaceholderText("Enter Your Email").value).toBe("test@example.com");
    expect(getByPlaceholderText("Enter Your Answer").value).toBe("my answer");
    expect(getByPlaceholderText("Enter Your New Password").value).toBe("newpassword");
  });

  it("should successfully reset password", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Password reset successfully",
      },
    });

    const navigate = jest.fn();
    useNavigate.mockReturnValue(navigate);

    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Answer"), {
      target: { value: "my answer" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your New Password"), {
      target: { value: "newpassword" },
    });
    fireEvent.click(getByText("Forgot Password"));

    await waitFor(() => expect(axios.post).toHaveBeenCalledWith("/api/v1/auth/forgot-password", {
      email: "test@example.com",
      answer: "my answer",
      newPassword: "newpassword",
    }));

    expect(toast.success).toHaveBeenCalledWith("Password reset successfully", expect.any(Object));
    expect(navigate).toHaveBeenCalledWith("/login");
  });

  it("should display error message if reset fails", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        success: false,
        message: "Invalid credentials",
      },
    });

    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Enter Your Email"), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Answer"), {
      target: { value: "wrong answer" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your New Password"), {
      target: { value: "newpassword" },
    });
    fireEvent.click(getByText("Forgot Password"));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Invalid credentials"));
  });

  it("should show error if API call fails", async () => {
    axios.post.mockRejectedValueOnce(new Error("Something went wrong"));

    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Answer"), {
      target: { value: "my answer" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your New Password"), {
      target: { value: "newpassword" },
    });
    fireEvent.click(getByText("Forgot Password"));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Something went wrong"));
  });

  it('should display error messages if fields are invalid', async () => {
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Answer"), {
      target: { value: "my answer" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your New Password"), {
      target: { value: "new" },
    });
    fireEvent.click(getByText("Forgot Password"));

    expect(getByText("Valid email is required")).toBeInTheDocument();
    expect(getByText("Password must be at least 6 characters long")).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });
});