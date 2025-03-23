import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import orderModel from "../../models/orderModel";
import { brainTreePaymentController } from "../productController";
import braintree from "braintree"; // Mock this for testing

jest.mock("braintree", () => {
  const mockSaleSingleton = jest.fn();
  const mockGenerateSingleton = jest.fn();

  return {
    BraintreeGateway: jest.fn().mockImplementation(() => ({
      transaction: {
        sale: mockSaleSingleton,
      },
      clientToken: {
        generate: mockGenerateSingleton,
      },
    })),
    Environment: {
      Sandbox: "sandbox",
    },
    __mockSaleSingleton__: mockSaleSingleton, // Expose for test assertions
    __mockGenerateSingleton: mockGenerateSingleton, // Expose for test assertions
  };
});

// This is to ensure that the jest function returned for the transaction.sale method
// is the same for ALL braintree singletons.
const mockSaleSingleton = braintree.__mockSaleSingleton__;
const mockGenerateSingleton = braintree.__mockGenerateSingleton;

describe("brainTreePaymentController Integration Test", () => {
  let mongoServer;
  let mockReq, mockRes;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await orderModel.deleteMany({});

    mockReq = {
      body: {
        nonce: "valid-nonce",
        cart: [
          { _id: new mongoose.Types.ObjectId(), price: 50 },
          { _id: new mongoose.Types.ObjectId(), price: 100 },
        ],
      },
      user: { _id: new mongoose.Types.ObjectId() }, // Mock user ID
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };

    process.env.BRAINTREE_MERCHANT_ID = "merchantId";
    process.env.BRAINTREE_PUBLIC_KEY = "publicKey";
    process.env.BRAINTREE_PRIVATE_KEY = "privateKey";
  });

  afterEach(async () => {
    await orderModel.deleteMany({});
  });

  it("should successfully process a payment and create an order", async () => {
    mockSaleSingleton.mockImplementation((data, callback) =>
      callback(null, { id: "12345", amount: 150 })
    );

    await brainTreePaymentController(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({ ok: true });

    const orders = await orderModel.find();
    expect(orders.length).toBe(1);
    expect(orders[0].payment).toEqual({ id: "12345", amount: 150 });
  });

  it("should return an error if payment fails", async () => {
    mockSaleSingleton.mockImplementation((data, callback) =>
      callback({ message: "Payment Failed" }, null)
    );

    await brainTreePaymentController(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({ message: "Payment Failed" });

    const orders = await orderModel.find();
    expect(orders.length).toBe(0); // No order should be created
  });

  it("should handle unexpected errors gracefully", async () => {
    mockSaleSingleton.mockImplementation(() => {
      throw new Error("Unexpected Error");
    });

    await brainTreePaymentController(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith(expect.any(Error));

    const orders = await orderModel.find();
    expect(orders.length).toBe(0);
  });
});
