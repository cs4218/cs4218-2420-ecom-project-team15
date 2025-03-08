import mongoose from 'mongoose';
import Product from '../models/productModel.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('productModel Unit Tests', () => {
    let mongoServer;

    beforeAll(async() => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    });

    afterEach(async () => {
        await Product.deleteMany({});
    });

    afterAll(async() => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    it('should create & save product successfully', async () => {
        const product = new Product({
            name: "test product",
            slug: "test-product",
            description: "test product description",
            price: 100,
            category: new mongoose.Types.ObjectId(),
            quantity: 10,
            shipping: true,
            photo: {
                data: Buffer.from('test photo data'),
                contentType: 'image/png'
            }
        });
        const savedProduct = await product.save();

        expect(savedProduct._id).toBeDefined();
        expect(savedProduct.name).toBe(product.name);
        expect(savedProduct.slug).toBe(product.slug);
        expect(savedProduct.description).toBe(product.description);
        expect(savedProduct.price).toBe(product.price);
        expect(savedProduct.category).toBe(product.category);
        expect(savedProduct.quantity).toBe(product.quantity);
        expect(savedProduct.shipping).toBe(product.shipping);
        expect(savedProduct.photo.data).toEqual(product.photo.data);
        expect(savedProduct.photo.contentType).toBe(product.photo.contentType);
    });

    it('should fail to save product with missing fields', async () => {
        const invalidProduct = new Product({
            name: "this product is incomplete"
        });

        await expect(invalidProduct.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should save product without optional fields', async () => {
        //shipping is an optional field
        const product = new Product({
            name: "test product",
            slug: "test-product",
            description: "test product description",
            price: 100.1,
            category: new mongoose.Types.ObjectId(),
            quantity: 10,
            photo: {
                data: Buffer.from('test photo data'),
                contentType: 'image/png'
            },
        });
        const savedProduct = await product.save();

        //expect product to be saved successfully without optional fields
        expect(savedProduct._id).toBeDefined();
        expect(savedProduct.name).toBe(product.name);
        expect(savedProduct.slug).toBe(product.slug);
        expect(savedProduct.description).toBe(product.description);
        expect(savedProduct.price).toBe(product.price);
        expect(savedProduct.category).toBe(product.category);
        expect(savedProduct.quantity).toBe(product.quantity);
    });

    it('should fail to save the product with negative price', async () => {
        const product = new Product({
            name: "test product",
            slug: "test-product",
            description: "test product description",
            price: -100,
            category: new mongoose.Types.ObjectId(),
            quantity: 10,
        });

        await expect(product.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should fail to save the product with price that has more than 2 decimals', async () => {
        const product = new Product({
            name: "test product",
            slug: "test-product",
            description: "test product description",
            price: 100.553,
            category: new mongoose.Types.ObjectId(),
            quantity: 10,
        });

        await expect(product.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should fail to save the product with negative quantity', async () => {
        const product = new Product({
            name: "test product",
            slug: "test-product",
            description: "test product description",
            price: 100,
            category: new mongoose.Types.ObjectId(),
            quantity: -10,
        });

        await expect(product.save()).rejects.toThrow(mongoose.Error.ValidationError);
    })

    it('should fail to save the product with decimal quantity', async () => {
        const product = new Product({
            name: "test product",
            slug: "test-product",
            description: "test product description",
            price: 100,
            category: new mongoose.Types.ObjectId(),
            quantity: 10.1,
        });

        await expect(product.save()).rejects.toThrow(mongoose.Error.ValidationError);
    })
})