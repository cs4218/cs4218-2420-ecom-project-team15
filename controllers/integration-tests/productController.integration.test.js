// Done By: Jamie Toh
// Integration tests of productController and productModel
// Admin View Products: createProductController, getProductController, deleteProductController, updateProductController
// Others: getSingleProductController, productPhotoController, productFiltersController, productCountController, productListController

import mongoose, { MongooseError } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Product from '../../models/productModel';
import Category from '../../models/categoryModel';
import { createProductController, getProductController, deleteProductController, updateProductController, getSingleProductController, productPhotoController, productFiltersController, productCountController, productListController } from '../productController';
import productModel from '../../models/productModel';

jest.unmock('../../models/productModel');
jest.unmock('../../models/categoryModel');

const res = {
    set: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
};

describe('ProductController Integration Tests', () => {
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(async () => {
        await Product.deleteMany({});
        await Category.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    describe('createProductController Integration Tests', () => {
        it('should create and save a product successfully', async () => {

            const category = new Category({ name: 'test category', slug: 'test-category' });
            await category.save();

            const req = {
                fields: {
                    name: 'test product',
                    description: 'test product description',
                    price: 100,
                    category: category._id,
                    quantity: 10,
                },
                files: {
                    photo: {
                        path: 'test.jpg',
                        type: 'image/jpeg',
                        size: 1000,
                    },
                },
            };
    
            jest.spyOn(require('fs'), 'readFileSync').mockReturnValue(Buffer.from('fake photo data'));
    
            await createProductController(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.send).toHaveBeenCalledWith({
                success: true,
                message: 'Product Created Successfully',
                products: expect.objectContaining({
                    name: 'test product',
                    description: 'test product description',
                    price: 100,
                    category: category._id,
                    quantity: 10,
                    photo: expect.objectContaining({
                        data: expect.any(Buffer),
                        contentType: 'image/jpeg',
                    }),
                }),
            })
    
            const savedProduct = res.send.mock.calls[0][0].products;
            //check that product saved in db is the same as the returned product
            const product = await Product.findOne({name: savedProduct.name});
            expect(savedProduct.name).toStrictEqual(product.name);
            expect(savedProduct.description).toStrictEqual(product.description);
            expect(savedProduct.price).toStrictEqual(product.price);
            expect(savedProduct.category).toStrictEqual(product.category);
            expect(savedProduct.quantity).toStrictEqual(product.quantity);
            expect(savedProduct.photo.data).toStrictEqual(product.photo.data);
        });
    
        it('should fail to create and save a product when there is a missing field', async () => {
            const category = new Category({ name: 'test category', slug: 'test-category' });
            await category.save();
    
            const badReq = {
                fields: {
                    name: 'invalid test product',
                    description: 'test product description',
                    price: 100.2,
                    category: category._id,
                },
                files: {
                    photo: {
                        path: 'test.jpg',
                        type: 'image/jpeg',
                        size: 1000,
                    },
                },
            };
    
            jest.spyOn(require('fs'), 'readFileSync').mockReturnValue(Buffer.from('fake photo data'));
    
            await createProductController(badReq, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({
                error: "Quantity is Required",
            });
    
            // check that the product is not saved to db
            const product = await Product.findOne({name: 'invalid test product'});
            expect(product).toBeNull();
        });
    
        it('should fail to create and save a product when it does not pass model validation', async () => {
            jest.clearAllMocks();
            const category = new Category({ name: 'test category', slug: 'test-category' });
            await category.save();
    
            const req = {
                fields: {
                    name: 'invalid test product',
                    description: 'test product description',
                    price: 100.222,
                    category: category._id,
                    quantity: 10,
                },
                files: {
                    photo: {
                        path: 'test.jpg',
                        type: 'image/jpeg',
                        size: 1000,
                    },
                },
            };
    
            jest.spyOn(require('fs'), 'readFileSync').mockReturnValue(Buffer.from('fake photo data'));
    
            await createProductController(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                error: expect.any(MongooseError),
                message: "Error while creating product",
                success: false,
            });
    
            // check that the product is not saved to db
            const product = await Product.findOne({name: 'invalid test product'});
            expect(product).toBeNull();
        });
    })

    describe('deleteProductController Integration Tests', () => {
        it('should delete a product successfully', async () => {
            const category = new Category({ name: 'test category', slug: 'test-category' });
            await category.save();
            const product = new Product({
                name: 'test delete product',
                slug: 'test-delete-product',
                description: 'test delete product description',
                price: 100,
                category: category._id,
                quantity: 10,
                photo: {
                    data: Buffer.from('fake photo data'),
                    contentType: 'image/jpeg',
                },
            });
            await product.save();

            await deleteProductController({ params: { pid: product._id } }, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                success: true,
                message: 'Product Deleted successfully',
            });
        });

        it('should return an error when product cannot be deleted', async () => {
            jest.clearAllMocks();
            const productId = new mongoose.Types.ObjectId();
            jest.spyOn(productModel, 'findByIdAndDelete').mockImplementation(() => {
            throw new Error('Error while deleting product');
            });

            await deleteProductController({ params: { pid: productId } }, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: 'Error while deleting product',
            error: expect.any(Error),
            });
        });
    })

    describe('updateProductController Integration Tests', () => {
        it('should update a product successfully', async () => {
            const category = new Category({ name: 'test category', slug: 'test-category' });
            await category.save();

            const product = new Product({
                name: 'test update product',
                slug: 'test-update-product',
                description: 'test update product description',
                price: 100,
                category: category._id,
                quantity: 10,
                photo: {
                    data: Buffer.from('fake photo data'),
                    contentType: 'image/jpeg',
                },
            });
            await product.save();
            
            const req = {
                params: { pid: product._id },
                fields: {
                    name: 'updated product name',
                    description: 'updated description',
                    price: 150,
                    category: category._id,
                    quantity: 20,
                },
                files: {
                    photo: {
                        size: 1000,
                        path: 'path/to/mock/photo.jpg',
                        type: 'image/jpeg'
                    }
                }
            };

            jest.spyOn(require('fs'), 'readFileSync').mockReturnValue(Buffer.from('updated photo data'));

            await updateProductController(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                success: true,
                message: 'Product Updated Successfully',
                products: expect.any(Object)
            });

            const updatedProduct = await Product.findById(product._id);
            expect(updatedProduct.name).toBe('updated product name');
            expect(updatedProduct.description).toBe('updated description');
            expect(updatedProduct.price).toBe(150);
            expect(updatedProduct.category).toStrictEqual(category._id);
            expect(updatedProduct.quantity).toBe(20);
            expect(updatedProduct.photo.data.toString()).toEqual('updated photo data');
        });

        it('should return an error when product cannot be updated', async () => {
            jest.clearAllMocks();
            const category = new Category({ name: 'test category', slug: 'test-category' });
            await category.save();
            const product = new Product({
                name: 'test update product',
                slug: 'test-update-product',
                description: 'test update product description',
                price: 100,
                category: category._id,
                quantity: 10,
                photo: {
                    data: Buffer.from('fake photo data'),
                    contentType: 'image/jpeg',
                },
            });
            await product.save();
            // mock an error when updating product
            jest.spyOn(productModel, 'findByIdAndUpdate').mockImplementation(() => {
                throw new Error('Error while updating product');
            });

            const req = {
                params: { pid: product._id },
                fields: {
                    name: 'updated product name',
                    description: 'updated description',
                    price: 150,
                    category: category._id,
                    quantity: 20,
                },
                files: {
                    photo: {
                        size: 1000,
                        path: 'path/to/mock/photo.jpg',
                        type: 'image/jpeg'
                    }
                }
            };
            jest.spyOn(require('fs'), 'readFileSync').mockReturnValue(Buffer.from('updated photo data'));
            await updateProductController(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                message: 'Error while updating product',
                error: expect.any(Error),
            });

        });
    })

    describe('getProductController Integration Tests', () => {
        beforeEach(async () => {
            await Product.deleteMany({});
            await Category.deleteMany({});
        });
        it('should retrieve all products successfully from the database', async () => {
            // already tested in previous test
            const category = new Category({ name: 'test category', slug: 'test-category' });
            await category.save();
            const req = {
                fields: {
                    name: 'test product',
                    description: 'test product description',
                    price: 100.2,
                    category: category._id,
                    quantity: 10,
                },
                files: {
                    photo: {
                        path: 'test.jpg',
                        type: 'image/jpeg',
                        size: 1000,
                    },
                },
            };
            jest.spyOn(require('fs'), 'readFileSync').mockReturnValue(Buffer.from('fake photo data'));
            await createProductController(req, res);
            jest.clearAllMocks();

            await getProductController(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            const returnedProduct = await Product.find({});
            console.log(res);
            expect(res.name).toStrictEqual(returnedProduct.name);
            expect(res.description).toStrictEqual(returnedProduct.description);
            expect(res.price).toStrictEqual(returnedProduct.price);
            expect(res.category).toStrictEqual(returnedProduct.category);
            expect(res.quantity).toStrictEqual(returnedProduct.quantity);
            expect(res.photo).toStrictEqual(returnedProduct.photo);
        });

        it('should return error when there are no products in the database', async () => {
            jest.clearAllMocks();
            const error = jest.spyOn(productModel, 'find').mockImplementation(() => {
                throw new Error('Error in getting products');
            });

            await getProductController({}, res);
            console.log('Response:', res.send.mock.calls);
            expect(res.status).toHaveBeenCalledWith(500);
            const response = res.send.mock.calls[0][0];
            expect(response.success).toBe(false);
            expect(response.message).toBe('Error in getting products');
            error.mockRestore();
        });
    })

    describe('getSingleProductController Integration Tests', () => {
        it('should retrieve a single product successfully from the database', async () => {
            jest.clearAllMocks();
            const category = new Category({ name: 'test category', slug: 'test-category' });
            await category.save();
            const product = new Product({
                name: 'test product',
                slug: 'test-single-product',
                description: 'test product description',
                price: 100.2,
                category: category._id,
                quantity: 10,
                photo: {
                    data: Buffer.from('fake photo data'),
                    contentType: 'image/jpeg',
                },
            });
            await product.save();

            const req = {
                params: { slug: 'test-single-product' }
            };

            await getSingleProductController(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                success: true,
                message: 'Single Product Fetched',
                product: expect.objectContaining({
                    name: 'test product',
                    slug: 'test-single-product',
                    description: 'test product description',
                    price: 100.2,
                    quantity: 10,
                    category: expect.objectContaining({
                        _id: category._id,
                        name: 'test category',
                        slug: 'test-category',
                    }),
                }),
            });
        });

        it('should return error when product is not found in the database', async () => {
            jest.clearAllMocks();
            Product.deleteMany({});
            const req = {
                params: { slug: 'non-existent-product' }
            };

            await getSingleProductController(req, res);
            console.log('Status called with:', res.status.mock.calls);
            console.log('Send called with:', res.send.mock.calls);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                message: 'Product Not Found',
            });
        });
    })

    describe('productPhotoController Integration Tests', () => {
        it('should return a product photo successfully', async () => {
            jest.clearAllMocks();
            const category = new Category({ name: 'test category', slug: 'test-category' });
            await category.save();
            const product = new Product({
                name: 'test product',
                slug: 'test-product',
                description: 'test product description',
                price: 100.2,
                category: category._id,
                quantity: 10,
                photo: {
                    data: Buffer.from('fake photo data'),
                    contentType: 'image/jpeg',
                },
            });
            await product.save();

            await productPhotoController({params: {pid: product._id }}, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(product.photo.data);
        });

        it('should return an error when photo cannot be retrieved', async () => {
            jest.clearAllMocks();
            const product = new Product({
                name: 'test product',
                slug: 'test-product',
                description: 'test product description',
                price: 100.2,
                category: new mongoose.Types.ObjectId(),
                quantity: 10,
                photo: {
                    data: Buffer.from('fake photo data'),
                    contentType: 'image/jpeg',
                },
            });
            await product.save();

            const error = jest.spyOn(productModel, 'findById').mockImplementation(() => {
                throw new Error('Error while fetching photo');
            });

            await productPhotoController({params: {pid: product._id }}, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                message: 'Error while getting photo',
                error: expect.any(Error),
            });
            error.mockRestore();
        });
    })

    describe('productFiltersController Integration Tests', () => {
        it('should filter products successfully', async () => {
            jest.clearAllMocks();
            const category = new Category({ name: 'test filter category', slug: 'test-filter-category' });
            await category.save();
            const product = new Product({
                name: 'test product',
                slug: 'test-product',
                description: 'test product description',
                price: 100.2,
                category: category._id,
                quantity: 10,
                photo: {
                    data: Buffer.from('fake photo data'),
                    contentType: 'image/jpeg',
                },
            });
            await product.save();

            const req = {
                body: {
                    checked: [],
                    radio: [],
                }
            };

            await productFiltersController(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            const returnedProduct = res.send.mock.calls[0][0].products[0];
            expect(returnedProduct.name).toBe('test product');
            expect(returnedProduct.description).toBe('test product description');
            expect(returnedProduct.price).toBe(100.2);
            expect(returnedProduct.category).toStrictEqual(category._id);
            expect(returnedProduct.quantity).toBe(10);
            expect(returnedProduct.photo.data.toString()).toBe('fake photo data');
        });

        it('should return an error when products cannot be filtered', async () => {
            jest.clearAllMocks();
            const error = jest.spyOn(productModel, 'find').mockImplementation(() => {
                throw new Error('Error while filtering products');
            });

            await productFiltersController({}, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                message: 'Error while filtering products',
                error: expect.any(Error),
            });
            error.mockRestore();
        });
    })

    describe('productCountController Integration Tests', () => {
        it('should return the count of products successfully', async () => {
            jest.clearAllMocks();
            const category = new Category({ name: 'test category', slug: 'test-category' });
            await category.save();
            const product = new Product({
                name: 'test product',
                slug: 'test-product',
                description: 'test product description',
                price: 100.2,
                category: category._id,
                quantity: 10,
                photo: {
                    data: Buffer.from('fake photo data'),
                    contentType: 'image/jpeg',
                },
            });
            await product.save();

            await productCountController({}, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                success: true,
                total: 1,
            });
        });

        it('should return an error when count of products cannot be retrieved', async () => {
            jest.clearAllMocks();
            const error = jest.spyOn(productModel, 'find').mockImplementation(() => {
                throw new Error('Error while getting product count');
            });

            await productCountController({}, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                message: 'Error in product count',
                error: expect.any(Error),
            });
            error.mockRestore();
        });
    })

    describe('productListController Integration Tests', () => {
        it('should return a list of products successfully', async () => {
            jest.clearAllMocks();
            const category = new Category({ name: 'test category', slug: 'test-category' });
            await category.save();
            const productList = [
                {
                    name: 'test product',
                    slug: 'test-product',
                    description: 'test product description',
                    price: 100,
                    category: category._id,
                    quantity: 10,
                    photo: {
                        data: Buffer.from('fake photo data'),
                        contentType: 'image/jpeg',
                    },
                },
                {
                    name: 'test product 2',
                    slug: 'test-product-2',
                    description: 'test product description 2',
                    price: 200.2,
                    category: category._id,
                    quantity: 20,
                    photo: {
                        data: Buffer.from('fake photo data 2'),
                        contentType: 'image/jpeg',
                    },
                }
            ];
            await Product.insertMany(productList);

            await productListController({ params: { page: 1 } }, res);
            expect(res.status).toHaveBeenCalledWith(200);
            const returnedProducts = res.send.mock.calls[0][0].products;
            // check that the returned products are the same as the inserted products
            expect(returnedProducts.length).toBe(2);
            expect(returnedProducts[0].name).toBe(productList[0].name);
            expect(returnedProducts[0].description).toBe(productList[0].description);
            expect(returnedProducts[0].price).toBe(productList[0].price);
            expect(returnedProducts[0].category).toStrictEqual(productList[0].category);
            expect(returnedProducts[0].quantity).toBe(productList[0].quantity);
            expect(returnedProducts[0].photo);
            expect(returnedProducts[1].name).toBe(productList[1].name);
            expect(returnedProducts[1].description).toBe(productList[1].description);
            expect(returnedProducts[1].price).toBe(productList[1].price);
            expect(returnedProducts[1].category).toStrictEqual(productList[1].category);
            expect(returnedProducts[1].quantity).toBe(productList[1].quantity);
            expect(returnedProducts[1].photo);
        });

        it('should return an error when products cannot be retrieved', async () => {
            jest.clearAllMocks();
            const error = jest.spyOn(productModel, 'find').mockImplementation(() => {
                throw new Error('Error while getting products');
            });

            await productListController({ params: { page: 1 } }, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                message: 'error in per page ctrl',
                error: expect.any(Error),
            });
            error.mockRestore();
        });
    })
});