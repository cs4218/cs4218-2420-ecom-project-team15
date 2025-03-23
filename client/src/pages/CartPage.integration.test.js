import axios from "axios";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import HomePage from "./HomePage";
import { AuthContext } from "../context/auth";
import { SearchProvider } from "../context/search";
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import { CartProvider } from "../context/cart";
import toast from "react-hot-toast";

axios.defaults.baseURL = "http://localhost:6060"; 
let token;
let mockAuth;

beforeAll(async () => {
  global.matchMedia =
    global.matchMedia ||
    function () {
      return {
        matches: false,
        addListener: jest.fn(),
        removeListener: jest.fn(),
      };
    };
  try {
    const response = await axios.post("/api/v1/auth/login", {
      email: "glenn.ong13@gmail.com",
      password: "Qwerty1234567890",
    });

    token = response.data.token;
    mockAuth = [{ token, user: { _id: "67df099734cfd55106c0b697", name: "glenn.ong13@gmail.com" } }, jest.fn()];
    axios.defaults.headers["Authorization"] = `${token}`;
  } catch (error) {
    console.log("Error during beforeAll setup:", error);
  }
});

afterEach(() => {
    localStorage.removeItem("cart");
  });

describe("HomePage — Real View -> Controller -> Model Integration Tests", () => {
  test("renders HomePage with products and add to cart functionality", async () => {
    render(
      <Router>
        <AuthContext.Provider value={mockAuth}>
          <CartProvider>
            <SearchProvider>
              <HomePage />
            </SearchProvider>
          </CartProvider>
        </AuthContext.Provider>
      </Router>
    );

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText(/William 2025 Racing Kit/i)).toBeInTheDocument();
      expect(screen.getByText(/\$78.00/)).toBeInTheDocument();
    });

    const addToCartButton = screen.getAllByText(/Add To Cart/);
    fireEvent.click(addToCartButton[0]);


    await waitFor(() => {
        expect(toast.success);
        const toastMessage = screen.getByText('Item added to cart');  
        expect(toastMessage).toBeInTheDocument();
      });


    const cart = JSON.parse(localStorage.getItem("cart"));
    expect(cart).toHaveLength(1);
    expect(cart[0].name).toMatch(/William 2025 Racing Kit/i); 
  });

});
