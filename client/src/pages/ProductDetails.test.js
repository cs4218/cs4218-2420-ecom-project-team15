import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import ProductDetails from './ProductDetails';
import '@testing-library/jest-dom/extend-expect';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

// Mock Cart context
jest.mock("../context/cart", () => ({
    useCart: jest.fn(() => [null, jest.fn()]),
}));

// Mocking dependencies
jest.mock('axios');
jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
    useNavigate: jest.fn(),
}));

// Mock Layout component
jest.mock('../components/Layout', () => ({ children }) => <div>{children}</div>);

// Mock Product
const mockProduct = {
    _id: '1',
    name: 'Product 1',
    description: 'Product Description 1',
    price: 100,
    category: {
        _id: '1',
        name: 'Category 1',
    },
    slug: 'product-slug',
};

const relatedProducts = [{
    _id: '1',
    name: 'Related Product 1',
    description: 'Related Product Description 1',
    price: 50,
    category: {
        _id: '1',
        name: 'Category 1',
    },
    slug: 'related-product-1',
},
{
    _id: '2',
    name: 'Related Product 2',
    description: 'Related Product Description 2',
    price: 150,
    category: {
        _id: '2',
        name: 'Category 2',
    },
    slug: 'related-product-2',
}]

// ProductDetails component test
describe('ProductDetails Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterAll(() => {
        console.log.mockRestore();
    });

    it('should render component successfully', async () => {
        useParams.mockReturnValue({ slug: 'product-slug' });
        const { getByText } = render(<ProductDetails />);
        expect(useNavigate).toHaveBeenCalled();
        expect(getByText('Product Details')).toBeInTheDocument();
    });

    it('should render product details successfully with no related products', async () => {
        useParams.mockReturnValue({ slug: 'product-slug' });
        axios.get.mockImplementation((url) => {
            switch (url) {
                case '/api/v1/product/get-product/product-slug':
                    return Promise.resolve({ data: { product: {
                        ...mockProduct,
                    }}});
                case '/api/v1/product/related-product/1/1':
                    return Promise.resolve({ data: { products: [] } });
                default:
                    return Promise.resolve({ data: {} });
            }
        })
        const { getByText } = render(<ProductDetails />);
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(`/api/v1/product/get-product/product-slug`);
        });
        expect(getByText('Product Details')).toBeInTheDocument();
        await waitFor(() => {
            expect(getByText('Name : Product 1')).toBeInTheDocument();
        });
        await waitFor(() => {
            expect(getByText('Description : Product Description 1')).toBeInTheDocument();
        });
        await waitFor(() => {
            expect(getByText('Price : $100.00')).toBeInTheDocument();
        });
        await waitFor(() => {
            expect(getByText('Category : Category 1')).toBeInTheDocument();
        });
        await waitFor(() => {
            expect(getByText('No Similar Products found')).toBeInTheDocument();
        })
    });

    it('should render product details error', async () => {
        useParams.mockReturnValue({ slug: 'product-slug' });
        axios.get.mockImplementation((url) => {
            switch (url) {
                case '/api/v1/product/get-product/product-slug':
                    return Promise.reject('Error occurred');
                case '/api/v1/product/related-product/1/1':
                    return Promise.resolve({ data: { products: [] } });
                default:
                    return Promise.resolve({ data: {} });
            }
        })
        render(<ProductDetails />);
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(`/api/v1/product/get-product/product-slug`);
        });
        // expect console.log to be called
        expect(console.log).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith('Error occurred');
    });

    it('should render related products', async () => {
        useParams.mockReturnValue({ slug: 'product-slug' });
        axios.get.mockImplementation((url) => {
            switch (url) {
                case '/api/v1/product/get-product/product-slug':
                    return Promise.resolve({ data: { product: {
                        ...mockProduct,
                    }}});
                case '/api/v1/product/related-product/1/1':
                    return Promise.resolve({ data: { products: relatedProducts } });
                default:
                    return Promise.resolve({ data: {} });
            }
        })
        const { getByText } = render(<ProductDetails />);
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(`/api/v1/product/related-product/1/1`);
        });
        await waitFor(() => {
            expect(getByText('Related Product 1')).toBeInTheDocument();
        });
        await waitFor(() => {
            expect(getByText('Related Product 2')).toBeInTheDocument();
        });
        await waitFor(() => {
            expect(getByText('Similar Products ➡️')).toBeInTheDocument();
        });
    });

    it('should render related product error', async () => {
        useParams.mockReturnValue({ slug: 'product-slug' });
        axios.get.mockImplementation((url) => {
            switch (url) {
                case '/api/v1/product/get-product/product-slug':
                    return Promise.resolve({ data: { product: {
                        ...mockProduct,
                    }}});
                case '/api/v1/product/related-product/1/1':
                    return Promise.reject('Error occurred');
                default:
                    return Promise.resolve({ data: {} });
            }
        })
        render(<ProductDetails />);
        // expect console.log to be called
        await waitFor(() => {
            expect(console.log).toHaveBeenCalled();
            
        });
        expect(console.log).toHaveBeenCalledWith('Error occurred');
    });

    it('should navigate to product page when clicked', async () => {
        useParams.mockReturnValue({ slug: 'product-slug' });
        axios.get.mockImplementation((url) => {
            switch (url) {
                case '/api/v1/product/get-product/product-slug':
                    return Promise.resolve({ data: { product: {
                        ...mockProduct,
                    }}});
                case '/api/v1/product/related-product/1/1':
                    return Promise.resolve({ data: { products: [
                        { ...relatedProducts[0] }
                    ] } });
                default:
                    return Promise.resolve({ data: {} });
            }
        })
        useNavigate.mockReturnValue(jest.fn());
        const navigate = useNavigate();
        const { getByText } = render(<ProductDetails />);
        await waitFor(() => {
            expect(getByText('More Details')).toBeInTheDocument();
        });
        fireEvent.click(getByText('More Details'));
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith('/product/related-product-1');
    });

    it('should not call getProduct when slug is not present', async () => {
        useParams.mockReturnValue({ slug: undefined });
        const getProduct = jest.fn();
        render(<ProductDetails getProduct={getProduct} />);
        expect(getProduct).not.toHaveBeenCalled();
    });
})