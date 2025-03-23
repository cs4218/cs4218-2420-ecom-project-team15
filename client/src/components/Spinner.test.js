import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useNavigate, useLocation } from "react-router-dom";
import Spinner from "../components/Spinner";
import "@testing-library/jest-dom/extend-expect";
import { act } from "react-dom/test-utils";


const mockNavigate = jest.fn();
const mockLocation = { pathname: "/current-page" };

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

describe("Spinner Component", () => {
  beforeEach(() => {
    jest.useFakeTimers(); 
  });

  afterEach(() => {
    jest.useRealTimers(); 
    jest.clearAllMocks(); 
  });

  it("renders the Spinner component correctly", () => {
    render(
      <MemoryRouter>
        <Spinner />
      </MemoryRouter>
    );

    expect(screen.getByText(/redirecting to you in 3 second/i)).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument(); 
  });

  it("counts down from 3 to 0 and navigates to login", async () => {
    render(
      <MemoryRouter>
        <Spinner />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/3 second/i)).toBeInTheDocument());
    act(() => jest.advanceTimersByTime(1000));
    await waitFor(() => expect(screen.getByText(/2 second/i)).toBeInTheDocument());
    act(() => jest.advanceTimersByTime(1000));
    await waitFor(() => expect(screen.getByText(/1 second/i)).toBeInTheDocument());
    
    act(() => jest.advanceTimersByTime(1000));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login", {
        state: "/current-page",
      });
    });
  });

  it("navigates to a custom path when provided", async () => {
    render(
      <MemoryRouter>
        <Spinner path="dashboard" />
      </MemoryRouter>
    );

    act(() => jest.advanceTimersByTime(3000));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard", {
        state: "/current-page",
      });
    });
  });

  it("clears the interval when unmounted", async () => {
    const { unmount } = render(
      <MemoryRouter>
        <Spinner />
      </MemoryRouter>
    );

    unmount(); 
    act(() => jest.advanceTimersByTime(3000));

    expect(mockNavigate).not.toHaveBeenCalled(); 
  });
});
