import mongoose from "mongoose";
import userModel from "./userModel";
import { MongoMemoryServer } from "mongodb-memory-server";

describe("userModel Test", () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await userModel.deleteMany();
  });

  it("should create a user successfully", async () => {
    const userData = {
      name: "John Doe",
      email: "test@example.com",
      password: "password",
      phone: "12345678",
      address: "123 Main St",
      answer: "Petname",
    };
    
    const user = await userModel.create(userData);
    expect(user).toHaveProperty("_id");
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
    expect(user.phone).toBe(userData.phone);
    expect(user.address).toBe(userData.address);
    expect(user.answer).toBe(userData.answer);
    expect(user.role).toBe(0); // Default value check
  });

  it("should create an admin successfully", async () => {
    const userData = {
      name: "John Doe",
      email: "test@example.com",
      password: "password",
      phone: "12345678",
      address: "123 Main St",
      answer: "Petname",
      role: 1,
    };
    
    const user = await userModel.create(userData);
    expect(user).toHaveProperty("_id");
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
    expect(user.phone).toBe(userData.phone);
    expect(user.address).toBe(userData.address);
    expect(user.answer).toBe(userData.answer);
    expect(user.role).toBe(1);
  });

  it("should not create a user without a name", async () => {
    const userData = {
      email: "test@example.com",
      password: "password",
      phone: "12345678",
      address: "123 Main St",
      answer: "Petname",
    };
    
    let err;
    try {
      await userModel.create(userData);
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.name).toBeDefined();
  });

  it("should not create a user without an email", async () => {
    const userData = {
      name: "John Doe",
      password: "password",
      phone: "12345678",
      address: "123 Main St",
      answer: "Petname",
    };
    
    let err;
    try {
      await userModel.create(userData);
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.email).toBeDefined();
  });

  it("should not create a user without a password", async () => {
    const userData = {
      name: "John Doe",
      email: "test@example.com",
      phone: "12345678",
      address: "123 Main St",
      answer: "Petname",
    };
    
    let err;
    try {
      await userModel.create(userData);
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.password).toBeDefined();
  });

  it("should not create a user without a phone number", async () => {
    const userData = {
      name: "John Doe",
      email: "test@example.com",
      password: "password",
      address: "123 Main St",
      answer: "Petname",
    };
    
    let err;
    try {
      await userModel.create(userData);
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.phone).toBeDefined();
  });

  it("should not create a user without an address", async () => {
    const userData = {
      name: "John Doe",
      email: "test@example.com",
      password: "password",
      phone: "12345678",
      answer: "Petname",
    };
    
    let err;
    try {
      await userModel.create(userData);
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.address).toBeDefined();
  });

  it("should not create a user without an answer", async () => {
    const userData = {
      name: "John Doe",
      email: "test@example.com",
      password: "password",
      phone: "12345678",
      address: "123 Main St",
    };
    
    let err;
    try {
      await userModel.create(userData);
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.answer).toBeDefined();
  });

  it("should enforce unique email constraint", async () => {
    const userData = {
      name: "Jane Doe",
      email: "test@example.com",
      password: "password",
      phone: "12345678",
      address: "123 Main St",
      answer: "Petname",
    };
    
    await userModel.create(userData);
    let err;
    try {
      await userModel.create(userData);
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.code).toBe(11000); // MongoDB duplicate key error code
  });
});
