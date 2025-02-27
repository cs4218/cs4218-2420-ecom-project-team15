import braintree from "braintree";
import { brainTreePaymentController, braintreeTokenController } from "./productController.js";
import orderModel from "../models/orderModel.js";

jest.mock("braintree", () => {
  const mockSaleSingleton = jest.fn();
  const mockGenerateSingleton = jest.fn();

  return {
    BraintreeGateway: jest.fn().mockImplementation(() => ({
      transaction: {
        sale: mockSaleSingleton,
      },
      clientToken: {
        generate: mockGenerateSingleton
      }
    })),
    Environment: {
      Sandbox: "sandbox",
    },
    __mockSaleSingleton__: mockSaleSingleton, // Expose for test assertions
    __mockGenerateSingleton: mockGenerateSingleton, // Expose for test assertions
  };
});

jest.mock("../models/orderModel", () => {
  return jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue({ _id: "order123" }), // Mock .save() method
  }));
});


// This is to ensure that the jest function returned for the transaction.sale method
// is the same for ALL braintree singletons.
const mockSaleSingleton = braintree.__mockSaleSingleton__;
const mockGenerateSingleton = braintree.__mockGenerateSingleton;

describe("brainTreePaymentController", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {
        nonce: "fake-nonce",
        cart: [],
      },
      user: { _id: "user123" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };



    process.env.BRAINTREE_MERCHANT_ID = "merchantId"
    process.env.BRAINTREE_PUBLIC_KEY = "publicKey"
    process.env.BRAINTREE_PRIVATE_KEY = "privateKey"
  });

  it("should successfully process the transaction", async () => {
    req.body.cart = [{ price: 10 }, { price: 15 }];
    req.body.nonce = "fake-nonce";
    req.user._id = 123;
    const totalAmount = req.body.cart.reduce((acc, item) => acc + item.price, 0);
    const mockResult = { success: true, transaction: { id: "txn123" } };


    mockSaleSingleton.mockImplementation((data, callback) => {
      callback(null, mockResult); // Simulate success
    });

    await brainTreePaymentController(req, res);

    expect(mockSaleSingleton).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: totalAmount,
        paymentMethodNonce: req.body.nonce,
        options: { submitForSettlement: true },
      }),
      expect.any(Function)
    );
    expect(orderModel).toHaveBeenCalledWith({
      products: req.body.cart,
      payment: mockResult,
      buyer: req.user._id
    })
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  it("should return 500 when transaction fails", async () => {
    // Mock failed transaction response
    const mockError = new Error("Transaction failed");

    mockSaleSingleton.mockImplementation((data, callback) => {
      callback(mockError, null); // Simulate failure
    });

    await brainTreePaymentController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(mockError);
  });

  it("should return 500 when a random error is thrown", async () => {
    // Mock failed transaction response
    const mockError = new Error("Random error");

    mockSaleSingleton.mockImplementation((data, callback) => {
      throw mockError
    });

    await brainTreePaymentController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(mockError);
  });
});


describe("brainTreeTokenController", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };

    process.env.BRAINTREE_MERCHANT_ID = "merchantId"
    process.env.BRAINTREE_PUBLIC_KEY = "publicKey"
    process.env.BRAINTREE_PRIVATE_KEY = "privateKey"
  });

  it("should successfully return the token", async () => {
    const mockToken = { "token": "This is a braintree token" };


    mockGenerateSingleton.mockImplementation((data, callback) => {
      callback(null, mockToken); // Simulate success
    });

    await braintreeTokenController(req, res);

    expect(mockGenerateSingleton).toHaveBeenCalledWith(
      {},
      expect.any(Function)
    );
    expect(res.send).toHaveBeenCalledWith(mockToken);
  });

  it("should return 500 generating the token fails", async () => {
    const mockError = new Error("Token generation failed");

    mockGenerateSingleton.mockImplementation((data, callback) => {
      callback(mockError, null); // Simulate failure
    });

    await braintreeTokenController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(mockError);
  });

  it("should return 500 when a random error is thrown", async () => {
    // Mock failed transaction response
    const mockError = new Error("Random error");

    mockGenerateSingleton.mockImplementation((data, callback) => {
      console.log(mockError.message)
      throw mockError
    });

    await braintreeTokenController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(mockError);
  });
});