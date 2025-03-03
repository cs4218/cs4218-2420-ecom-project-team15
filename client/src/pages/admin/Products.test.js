/**
 * @jest-environment jsdom
 */

import React from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Products from './Products';
import '@testing-library/jest-dom/extend-expect';

// Mocking dependencies
jest.mock('axios');
jest.mock('react-hot-toast');

// Mock AdminMenu component
jest.mock('../../components/AdminMenu', () => () => <div>AdminMenu</div>);

// Mock Layout component
jest.mock('../../components/Layout', () => ({ children }) => <div>{children}</div>);

// 
// Products component test
describe('Products Component', () => {
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
    

    it('should render main component successfully', async () => {
        const { getByText } = render(
            <MemoryRouter initialEntries={['/dashboard/admin/products']}>
                <Routes>
                    <Route path="/dashboard/admin/products" element={<Products />} />
                </Routes>
            </MemoryRouter>
        );
        expect(getByText('All Products List')).toBeInTheDocument();
    });

    it('should render all products successfully', async () => {
        axios.get.mockResolvedValue({
            data: {
                products: [
                    {
                        _id: '1',
                        name: 'Product 1',
                        description: 'Product Description 1',
                        slug: 'product-1',
                    },
                    {
                        _id: '2',
                        name: 'Product 2',
                        description: 'Product Description 2',
                        slug: 'product-2',
                    }
                ]
            }
        });

        const { getByText } = render(
            <MemoryRouter initialEntries={['/dashboard/admin/products']}>
                <Routes>
                    <Route path="/dashboard/admin/products" element={<Products />} />
                </Routes>
            </MemoryRouter>
        );

        // Wait for the API call to be made
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith('/api/v1/product/get-product');
            
        });
        // Wait for at least one product to be displayed
        await waitFor(() => {
            expect(getByText('Product 1')).toBeInTheDocument();
        });
        expect(getByText('Product Description 1')).toBeInTheDocument();
        expect(getByText('Product 2')).toBeInTheDocument();
        expect(getByText('Product Description 2')).toBeInTheDocument();
        
        // Check links and images
        const links = document.querySelectorAll('.product-link');
        expect(links).toHaveLength(2);
        expect(links[0]).toHaveAttribute('href', '/dashboard/admin/product/product-1');
        expect(links[1]).toHaveAttribute('href', '/dashboard/admin/product/product-2');
        const images = document.querySelectorAll('img');
        expect(images).toHaveLength(2);
        expect(images[0]).toHaveAttribute('src', '/api/v1/product/product-photo/1');
        expect(images[1]).toHaveAttribute('src', '/api/v1/product/product-photo/2');
    });

    it('should display error message on failed retrival of products', async () => {
        axios.get.mockRejectedValueOnce(new Error('Network Error'));

        render(
            <MemoryRouter initialEntries={['/dashboard/admin/products']}>
                <Routes>
                    <Route path="/dashboard/admin/products" element={<Products />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith('/api/v1/product/get-product');
        });

        expect(toast.error).toHaveBeenCalledWith('Something Went Wrong');
        expect(console.log).toHaveBeenCalledWith(new Error('Network Error'));
    });
})