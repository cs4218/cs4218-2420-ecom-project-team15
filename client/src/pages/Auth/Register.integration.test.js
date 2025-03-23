/**
 * @jest-environment node
 */

import axios from "axios";
import userModel from "../../../../models/userModel";
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "../../../../server";
import supertest from 'supertest';
import '@testing-library/jest-dom/extend-expect';
import { expect } from "@playwright/test";

dotenv.config();

jest.mock('../../context/auth', () => ({
  useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock('../../context/cart', () => ({
useCart: jest.fn(() => [null, jest.fn()]) // Mock useCart hook to return null state and a mock function
}));
  
jest.mock('../../context/search', () => ({
  useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
}));  

jest.mock('../../hooks/useCategory', () => jest.fn(() => []));

jest.spyOn(axios, "post");

describe("Register Component", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL);
  });
  afterAll(async () => {
    // delete the user created during the test
    try {
      await userModel.deleteOne({ email: "test@example.com" });
      await mongoose.connection.close();
    } catch (error) {
      console.error("Error cleaning up test user:", error);
    }
  });

  test("successfully register user", async () => {
    const name = "John Doe";
    const email = "test@example.com";
    const password = "password123";
    const phone = "12345678";
    const address = "123 Street";
    const answer = "Football";

    const res = await supertest(app)
      .post("/api/v1/auth/register")
      .send({ name, email, password, phone, address, answer });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("User Registered Successfully");
    expect(res.body.user.name).toBe(name);
    expect(res.body.user.email).toBe(email);
    expect(res.body.user.phone).toBe(phone);
    expect(res.body.user.address).toBe(address);
    expect(res.body.user.answer).toBe(answer);
  });

  test("fail to register user if user exists", async () => {
    const name = "John Doe";
    const email = "test2@example.com";
    const password = "password123";
    const phone = "12345678";
    const address = "123 Street";
    const answer = "Football";

    const res = await supertest(app)
      .post("/api/v1/auth/register")
      .send({ name, email, password, phone, address, answer });

    const res2 = await supertest(app)
      .post("/api/v1/auth/register")
      .send({ name, email, password, phone, address, answer });

    expect(res2.status).toBe(409);
    expect(res2.body.success).toBe(false);
  });

  test("fail to register user if name is missing", async () => {
    const name = "";
    const email = "test2@example.com";
    const password = "password123";
    const phone = "12345678";
    const address = "123 Street";
    const answer = "Football";

    const res = await supertest(app)
      .post("/api/v1/auth/register")
      .send({ name, email, password, phone, address, answer });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Name is Required");
  });

  test("fail to register user if email is missing", async () => {
    const name = "John Doe";
    const email = "";
    const password = "password123";
    const phone = "12345678";
    const address = "123 Street";
    const answer = "Football";

    const res = await supertest(app)
      .post("/api/v1/auth/register")
      .send({ name, email, password, phone, address, answer });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Email is Required");
  });

  test("fail to register user if password is missing", async () => {
    const name = "John Doe";
    const email = "test2@example.com";
    const password = "";
    const phone = "12345678";
    const address = "123 Street";
    const answer = "Football";

    const res = await supertest(app)
      .post("/api/v1/auth/register")
      .send({ name, email, password, phone, address, answer });
    
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Password is Required");
  });

  test("fail to register user if phone is missing", async () => {
    const name = "John Doe";
    const email = "test2@example.com";
    const password = "password123";
    const phone = "";
    const address = "123 Street";
    const answer = "Football";

    const res = await supertest(app)
      .post("/api/v1/auth/register")
      .send({ name, email, password, phone, address, answer });
    
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Phone no is Required");
  });

  test("fail to register user if address is missing", async () => {
    const name = "John Doe";
    const email = "test2@example.com";
    const password = "password123";
    const phone = "12345678";
    const address = "";
    const answer = "Football";

    const res = await supertest(app)
      .post("/api/v1/auth/register")
      .send({ name, email, password, phone, address, answer });
    
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Address is Required");
  });

  test("fail to register user if answer is missing", async () => {
    const name = "John Doe";
    const email = "test2@example.com";
    const password = "password123";
    const phone = "12345678";
    const address = "123 Street";
    const answer = "";

    const res = await supertest(app)
      .post("/api/v1/auth/register")
      .send({ name, email, password, phone, address, answer });
    
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Answer is Required");
  });
});
