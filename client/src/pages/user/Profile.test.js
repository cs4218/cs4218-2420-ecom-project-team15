/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import toast from 'react-hot-toast';
import Profile from './Profile';
import { useAuth } from '../../context/auth'; 

// Mocking dependencies
jest.mock('axios');
jest.mock('react-hot-toast');

// Mock auth context
const mockSetAuth = jest.fn();
const mockAuthContext = {
    user: {
        name: 'user@test.com',
        email: 'user@test.com',
        phone: '123',
        password: 'testing123',
        address: '123 Test'
    }
};

jest.mock('../../context/auth', () => ({
    useAuth: jest.fn(() => [mockAuthContext, mockSetAuth])
}));

// Mock UserMenu component
jest.mock('../../components/UserMenu', () => () => <div>UserMenu</div>);

// Mock Layout component
jest.mock('../../components/Layout', () => ({ children }) => <div>{children}</div>);

// Profile component test
describe('Profile Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterAll(() => {
        console.log.mockRestore();
    });

    afterEach(() => {
        console.log.mockClear();
    });

    it('should render with initial user data', async () => {
        const { getByPlaceholderText } = render(
            <MemoryRouter initialEntries={['/dashboard/user/profile']}>
                <Routes>
                    <Route path="/dashboard/user/profile" element={<Profile />} />
                </Routes>
            </MemoryRouter>
        );

        expect(getByPlaceholderText('Enter Your Name')).toHaveValue(mockAuthContext.user.name);
        expect(getByPlaceholderText('Enter Your Email')).toHaveValue(mockAuthContext.user.email);
        expect(getByPlaceholderText('Enter Your Email')).toBeDisabled();
        expect(getByPlaceholderText('Enter Your Phone')).toHaveValue(mockAuthContext.user.phone);
        expect(getByPlaceholderText('Enter Your Address')).toHaveValue(mockAuthContext.user.address);
    });

    it('should render empty form fields when user data is not available', async () => {
        const noUserMockAuth = { ...mockAuthContext, user: null };
        useAuth.mockReturnValueOnce([noUserMockAuth, mockSetAuth]);
        const { getByPlaceholderText } = render(
            <MemoryRouter initialEntries={['/dashboard/user/profile']}>
                <Routes>
                    <Route path="/dashboard/user/profile" element={<Profile />} />
                </Routes>
            </MemoryRouter>
        );

        expect(getByPlaceholderText('Enter Your Name')).toHaveValue('');
        expect(getByPlaceholderText('Enter Your Email')).toHaveValue('');
        expect(getByPlaceholderText('Enter Your Phone')).toHaveValue('');
        expect(getByPlaceholderText('Enter Your Address')).toHaveValue('');
    });

    it('should handle form updates', async () => {
        const updatedUser = {
            name: 'John Doe',
            email: mockAuthContext.user.email,
            phone: mockAuthContext.user.phone,
            address: mockAuthContext.user.address,
            password: mockAuthContext.user.password
        }

        axios.put.mockResolvedValueOnce({ data: { success: true, updatedUser: updatedUser } });

        const { getByPlaceholderText } = render(
            <MemoryRouter initialEntries={['/dashboard/user/profile']}>
                <Routes>
                    <Route path="/dashboard/user/profile" element={<Profile />} />
                </Routes>
            </MemoryRouter>
        );

        const nameInput = getByPlaceholderText('Enter Your Name');
        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        expect(nameInput).toHaveValue('John Doe');

        const passwordInput = getByPlaceholderText('Enter Your Password');
        fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'test123' } });
        expect(passwordInput).toHaveValue('test123');

        const phoneInput = getByPlaceholderText('Enter Your Phone');
        fireEvent.change(phoneInput, { target: { value: '1234567890' } });
        expect(phoneInput).toHaveValue('1234567890');

        const addressInput = getByPlaceholderText('Enter Your Address');
        fireEvent.change(addressInput, { target: { value: '123 Test' } });
        expect(addressInput).toHaveValue('123 Test');
    });

    it('should update user profile successfully with all fields filled correctly', async () => {
        const mockStorage = {
            auth: JSON.stringify({
                user: mockAuthContext.user
            })
        };

        jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => mockStorage[key]);
        jest.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
            mockStorage[key] = value;
        });

        const updatedUser = {
            name: 'John Doe',
            email: mockAuthContext.user.email,
            phone: '1234567890',
            address: 'newAddress',
            password: 'newPassword'
        };

        axios.put.mockResolvedValueOnce({
            data: {
                success: true,
                updatedUser: updatedUser
            }
        });

        const { getByText, getByPlaceholderText } = render(
            <MemoryRouter initialEntries={['/dashboard/user/profile']}>
                <Routes>
                    <Route path="/dashboard/user/profile" element={<Profile />} />
                </Routes>
            </MemoryRouter>
        );

        fireEvent.change(getByPlaceholderText('Enter Your Name'), { target: { value: 'John Doe' } });
        fireEvent.change(getByPlaceholderText('Enter Your Phone'), { target: { value: '1234567890' } });
        fireEvent.change(getByPlaceholderText('Enter Your Address'), { target: { value: 'newAddress' } });
        fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'newPassword' } });
        fireEvent.click(getByText('UPDATE'));

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith('/api/v1/auth/profile', updatedUser);
        });

        expect(toast.success).toHaveBeenCalled();
    });

    it('should accept all empty fields', async () => {
        const { getByText, getByPlaceholderText } = render(
            <MemoryRouter initialEntries={['/dashboard/user/profile']}>
                <Routes>
                    <Route path="/dashboard/user/profile" element={<Profile />} />
                </Routes>
            </MemoryRouter>
        );

        fireEvent.change(getByPlaceholderText('Enter Your Name'), { target: { value: '' } });
        fireEvent.change(getByPlaceholderText('Enter Your Phone'), { target: { value: '' } });
        fireEvent.change(getByPlaceholderText('Enter Your Address'), { target: { value: '' } });
        fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: '' } });
        fireEvent.click(getByText('UPDATE'));

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith('/api/v1/auth/profile', {
                name: '',
                email: mockAuthContext.user.email,
                phone: '',
                address: '',
                password: ''
            });
        });

        expect(toast.success).toHaveBeenCalled();

    });

    it('should display form update errors', async () => {
      axios.put.mockRejectedValueOnce(new Error('Network Error'));

      const { getByText, getByPlaceholderText } = render(
        <MemoryRouter initialEntries={['/dashboard/user/profile']}>
          <Routes>
            <Route path="/dashboard/user/profile" element={<Profile />} />
          </Routes>
        </MemoryRouter>
      );

      fireEvent.change(getByPlaceholderText('Enter Your Name'), { target: { value: 'John Doe' } });
      fireEvent.click(getByText('UPDATE'));

      await waitFor(() => {
        expect(axios.put).toHaveBeenCalledWith('/api/v1/auth/profile', {
          name: 'John Doe',
          email: mockAuthContext.user.email,
          phone: mockAuthContext.user.phone,
          address: mockAuthContext.user.address,
          password: ''
        });
      });

      expect(console.log).toHaveBeenCalledWith(new Error('Network Error'));
      expect(toast.error).toHaveBeenCalled();
    });

    it('should display API errors', async () => {
        axios.put.mockResolvedValueOnce({
          data: {
            error: 'Email cannot be changed.'
          }
        });
      
        const { getByText, getByPlaceholderText } = render(
          <MemoryRouter initialEntries={['/dashboard/user/profile']}>
            <Routes>
              <Route path="/dashboard/user/profile" element={<Profile />} />
            </Routes>
          </MemoryRouter>
        );
      
        fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'testEmail@gmail.com' } });
        fireEvent.click(getByText('UPDATE'));
      
        await waitFor(() => {
          expect(axios.put).toHaveBeenCalledWith('/api/v1/auth/profile', {
            name: mockAuthContext.user.name,
            email: "testEmail@gmail.com",
            phone: mockAuthContext.user.phone,
            address: mockAuthContext.user.address,
            password: ''
          });
        });
      
        expect(toast.error).toHaveBeenCalled();
      });
})