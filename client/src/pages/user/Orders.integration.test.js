import axios from 'axios';
import { render, screen, waitFor } from '@testing-library/react';
import Orders from '../../pages/user/Orders';
import { AuthContext } from '../../context/auth';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import "@testing-library/jest-dom/extend-expect";
import { CartProvider } from '../../context/cart';
import { SearchProvider } from '../../context/search';

axios.defaults.baseURL = 'http://localhost:6060'; // Make sure this matches the backend port

let token;
let mockAuth;
let orderId;

beforeAll(async () => {
  try {
    const response = await axios.post('/api/v1/auth/login', {
      email: 'glenn.ong13@gmail.com',
      password: 'Qwerty1234567890',
    });

    token = response.data.token;
    mockAuth = [{ token, user: { _id: '67df099734cfd55106c0b697', name: 'glenn.ong13@gmail.com' } }, jest.fn()];
    axios.defaults.headers['Authorization'] = `${token}`;

    const orderResponse = await axios.post('/api/v1/auth/orders', {
      status: 'Delivered',
      payment: { amount: 100, success: true },
      buyer: { _id: '67df099734cfd55106c0b697', name: 'glenn.ong13@gmail.com' },
      products: [{ _id: '66db427fdb0119d9234b27f3'}],
    }, {
        headers: { 'Authorization': `${token}` }
      });
      console.log("Order response:", orderResponse.data);
    orderId = orderResponse.data._id;

  } catch (error) {
    console.log("Error during beforeAll setup:", error);
    if (error.response) {
      console.log("Backend error:", error.response.data);
    } else if (error.request) {
      console.log("Request error:", error.request);
    } else {
      console.log("Error message:", error.message);
    }
  }
});

afterAll(async () => {
  try {
    await axios.delete(`/api/v1/auth/orders/${orderId}`,{
        headers: { 'Authorization': `${token}` }
      });
  } catch (error) {
    console.log("Error during afterAll cleanup:", error);
  }
});

describe('Orders Page — Real View -> Controller -> Model Integration Tests', () => {
  test('renders orders returned by backend', async () => {
    const logSpy = jest.spyOn(console, 'log');
    render(
      <Router>
        <AuthContext.Provider value={mockAuth}>
          <CartProvider>
            <SearchProvider>
              <Orders />
            </SearchProvider>
          </CartProvider>
        </AuthContext.Provider>
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText(/Delivered/i)).toBeInTheDocument();
      expect(screen.getByText(/glenn.ong13@gmail.com/i)).toBeInTheDocument();
      expect(screen.getByText(/A Powerful Laptop/i)).toBeInTheDocument();
    });
  });


  test('renders multiple orders if present', async () => {
    // Create a second order
    const secondOrderResponse = await axios.post('/api/v1/auth/orders', {
      status: 'Shipped',
      payment: { amount: 150, success: true },
      buyer: { _id: '67df099734cfd55106c0b697', name: 'glenn.ong13@gmail.com' },
      products: [{ _id: '66db427fdb0119d9234b27f9'}],
    }, {
        headers: { 'Authorization': `${token}` }
      });
      
    const secondOrderId = secondOrderResponse.data._id;

    render(
      <Router>
        <AuthContext.Provider value={mockAuth}>
          <CartProvider>
            <SearchProvider>
              <Orders />
            </SearchProvider>
          </CartProvider>
        </AuthContext.Provider>
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText(/A Powerful Laptop/i)).toBeInTheDocument();  
      expect(screen.getByText(/A bestselling novel/i)).toBeInTheDocument();  
    });

    await axios.delete(`/api/v1/auth/orders/${secondOrderId}`,{
      headers: { 'Authorization': `${token}` }
    });
  });
});
