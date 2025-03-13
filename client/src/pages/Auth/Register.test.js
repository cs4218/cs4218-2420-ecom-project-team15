import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import toast from 'react-hot-toast';
import Register from './Register';
import { useNavigate } from 'react-router-dom';
import { get } from 'http';

// Mocking axios.post
jest.mock('axios');
jest.mock('react-hot-toast');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
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

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register the user successfully', async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true } });

    const navigate = jest.fn();
    useNavigate.mockReturnValue(navigate);

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText('Enter Your Name'), { target: { value: 'John Doe' } });
    fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'password123' } });
    fireEvent.change(getByPlaceholderText('Enter Your Phone'), { target: { value: '1234567890' } });
    fireEvent.change(getByPlaceholderText('Enter Your Address'), { target: { value: '123 Street' } });
    fireEvent.change(getByPlaceholderText('Enter Your DOB'), { target: { value: '2000-01-01' } });
    fireEvent.change(getByPlaceholderText('What is Your Favorite Sport'), { target: { value: 'Football' } });

    fireEvent.click(getByText('REGISTER'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledWith("/api/v1/auth/register", {
      DOB: '2000-01-01',
      address: '123 Street',
      answer: 'Football',
      email: 'test@example.com',
      name: 'John Doe',
      password: 'password123',
      phone: '1234567890'
    }));
    expect(toast.success).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/login');
  });

  it('should display error message on failed registration', async () => {
    axios.post.mockRejectedValueOnce({ message: 'User already exists' });

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText('Enter Your Name'), { target: { value: 'John Doe' } });
    fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'password123' } });
    fireEvent.change(getByPlaceholderText('Enter Your Phone'), { target: { value: '1234567890' } });
    fireEvent.change(getByPlaceholderText('Enter Your Address'), { target: { value: '123 Street' } });
    fireEvent.change(getByPlaceholderText('Enter Your DOB'), { target: { value: '2000-01-01' } });
    fireEvent.change(getByPlaceholderText('What is Your Favorite Sport'), { target: { value: 'Football' } });

    fireEvent.click(getByText('REGISTER'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledWith("/api/v1/auth/register", {
      DOB: '2000-01-01',
      address: '123 Street',
      answer: 'Football',
      email: 'test@example.com',
      name: 'John Doe',
      password: 'password123',
      phone: '1234567890'
    }));
    expect(toast.error).toHaveBeenCalled();
  });

  it('should display error message if api call fails', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        success: false,
        message: 'Invalid credentials'
      }
    });

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText('Enter Your Name'), { target: { value: 'John Doe' } });
    fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'password123' } });
    fireEvent.change(getByPlaceholderText('Enter Your Phone'), { target: { value: '1234567890' } });
    fireEvent.change(getByPlaceholderText('Enter Your Address'), { target: { value: '123 Street' } });
    fireEvent.change(getByPlaceholderText('Enter Your DOB'), { target: { value: '2000-01-01' } });
    fireEvent.change(getByPlaceholderText('What is Your Favorite Sport'), { target: { value: 'Football' } });

    fireEvent.click(getByText('REGISTER'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledWith("/api/v1/auth/register", {
      DOB: '2000-01-01',
      address: '123 Street',
      answer: 'Football',
      email: 'test@example.com',
      name: 'John Doe',
      password: 'password123',
      phone: '1234567890'
    }));
    expect(toast.error).toHaveBeenCalled();
  });

  it('should display error messages if fields are invalid', async () => {
    axios.post.mockRejectedValueOnce({ message: 'User already exists' });

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText('Enter Your Name'), { target: { value: ' ' } });
    fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'test@g' } });
    fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'pass' } });
    fireEvent.change(getByPlaceholderText('Enter Your Phone'), { target: { value: '123456' } });
    fireEvent.change(getByPlaceholderText('Enter Your Address'), { target: { value: ' ' } });
    fireEvent.change(getByPlaceholderText('Enter Your DOB'), { target: { value: '2030-01-01' } });
    fireEvent.change(getByPlaceholderText('What is Your Favorite Sport'), { target: { value: ' ' } });

    fireEvent.click(getByText('REGISTER'));
    expect(axios.post).not.toHaveBeenCalled();
  });
});