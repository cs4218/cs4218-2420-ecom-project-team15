import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import express from 'express';
import orderModel from '../models/orderModel.js';
import productModel from '../models/productModel.js';
import userModel from '../models/userModel.js';
import { getOrdersController, getAllOrdersController, orderStatusController } from './authController.js';

const app = express();
app.use(express.json());

const fakeAuth = (req, res, next) => {
  req.user = { _id: userId }; 
  next();
};

app.get('/orders', fakeAuth, getOrdersController);
app.get('/all-orders', getAllOrdersController);
app.put('/order-status/:orderId', orderStatusController);

let mongoServer;
let userId;
let orderId;



beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  userId = new mongoose.Types.ObjectId();

  const productId = new mongoose.Types.ObjectId(); 
  const order = await orderModel.create({
    products: [productId],
    payment: { amount: 50 },
    buyer: userId,
    status: "Not Process",
  });

  orderId = order._id;
});

beforeEach(async () => {
    await orderModel.deleteMany({});
    await userModel.deleteMany({});
    await productModel.deleteMany({});
    
    const user = await userModel.create({
        name: "Test User",
        email: "test@example.com",
        password: "test123",
        phone: "1234567890",
        address: "123 Test Lane",
        answer: "testAnswer"
      });

    const categoryId = new mongoose.Types.ObjectId(); 

    const product = await productModel.create({
    name: "Test Product",
    slug: "test-product",
    description: "This is a test product",
    price: 9.99,
    quantity: 10,
    category: categoryId, 
    photo: {
        data: Buffer.from("fake-image-data"),
        contentType: "image/jpeg"
    },
    shipping: true
    });
      
    userId = user._id;
  
    const newOrder = await orderModel.create({
      products: [product._id],
      payment: { amount: 100 },
      buyer: userId,
      status: 'Not Process',
    });
  
    orderId = newOrder._id;
  });

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  jest.clearAllMocks();
});

describe('Order Controller Integration', () => {
  test('GET /orders should return orders for the logged-in user', async () => {
    const res = await request(app).get('/orders');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].buyer._id).toEqual(userId.toString());
  });

  test('GET /all-orders should return all orders sorted by createdAt desc', async () => {
    const res = await request(app).get('/all-orders');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]._id).toEqual(orderId.toString());
  });

  test('PUT /order-status/:orderId should update order status', async () => {
    const res = await request(app)
      .put(`/order-status/${orderId}`)
      .send({ status: 'Shipped' });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('Shipped');

    const updatedOrder = await orderModel.findById(orderId);
    expect(updatedOrder.status).toBe('Shipped');
  });

  test('GET /orders should return empty array if user has no orders', async () => {
    await orderModel.deleteMany({}); 
  
    const res = await request(app).get('/orders');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('PUT /order-status/:orderId should return 500 for invalid ObjectId', async () => {
    const res = await request(app)
      .put(`/order-status/invalid-id`)
      .send({ status: 'Delivered' });
  
    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Error While Updating Order');
  });
  
  test('PUT /order-status/:orderId should return 500 if wrong status', async () => {
    const res = await request(app)
      .put(`/order-status/${orderId}`)
      .send({status: "booya"}); 
  
    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });
  
});
