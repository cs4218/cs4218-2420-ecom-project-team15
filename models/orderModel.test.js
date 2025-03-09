import mongoose from "mongoose";
import Order from "../models/orderModel.js";
import { MongoMemoryServer } from "mongodb-memory-server";

describe("Order Model Unit Tests", () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterEach(async () => {
    await Order.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("should create & save an order successfully", async () => {
    const order = new Order({
      products: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()],
      payment: { method: "credit_card", amount: 500 },
      buyer: new mongoose.Types.ObjectId(),
      status: "Processing",
    });

    const savedOrder = await order.save();

    expect(savedOrder._id).toBeDefined();
    expect(savedOrder.products.length).toBe(2);
    expect(savedOrder.payment.method).toBe("credit_card");
    expect(savedOrder.payment.amount).toBe(500);
    expect(savedOrder.buyer).toBeDefined();
    expect(savedOrder.status).toBe("Processing");
  });

  it("should fail to save an order without required fields", async () => {
    const order = new Order({});

    await expect(order.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it("should save an order with the default status when not provided", async () => {
    const order = new Order({
      products: [new mongoose.Types.ObjectId()],
      payment: { method: "paypal", amount: 250 },
      buyer: new mongoose.Types.ObjectId(),
    });

    const savedOrder = await order.save();

    expect(savedOrder._id).toBeDefined();
    expect(savedOrder.status).toBe("Not Process"); // Default status
  });

  it("should fail to save an order with an invalid status", async () => {
    const order = new Order({
      products: [new mongoose.Types.ObjectId()],
      payment: { method: "cash", amount: 100 },
      buyer: new mongoose.Types.ObjectId(),
      status: "InvalidStatus", // Not in enum
    });

    await expect(order.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it("should fail to save an order with an empty products array", async () => {
    const order = new Order({
      products: [],
      payment: { method: "cash", amount: 100 },
      buyer: new mongoose.Types.ObjectId(),
    });

    await expect(order.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it("should fail to save an order with a negative payment amount", async () => {
    const order = new Order({
      products: [new mongoose.Types.ObjectId()],
      payment: { method: "credit_card", amount: -500 }, 
      buyer: new mongoose.Types.ObjectId(),
    });

    await expect(order.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it("should allow an order to be saved with different valid statuses", async () => {
    const validStatuses = ["Not Process", "Processing", "Shipped", "Delivered", "Cancelled"];

    for (const status of validStatuses) {
      const order = new Order({
        products: [new mongoose.Types.ObjectId()],
        payment: { method: "debit_card", amount: 75 },
        buyer: new mongoose.Types.ObjectId(),
        status: status,
      });

      const savedOrder = await order.save();
      expect(savedOrder.status).toBe(status);
    }
  });
});
