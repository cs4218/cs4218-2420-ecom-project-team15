/**
 * @jest-environment node
 */


import '@testing-library/jest-dom/extend-expect';
import mongoose from 'mongoose';
import supertest from 'supertest';
import User from '../../../../models/userModel';
import app from '../../../../server.js';
import bcrypt from 'bcrypt';

jest.mock('braintree', () => ({
    BraintreeGateway: jest.fn().mockImplementation(() => ({
      clientToken: {
        generate: jest.fn()
      },
      transaction: {
        sale: jest.fn()
      }
    })),
    Environment: {
      Sandbox: 'sandbox'
    }
  }));

describe('Profile API Integration Tests', () => {
    let authToken;
    let testUser;
    let request;

    beforeAll(async () => {
        jest.spyOn(console, 'log').mockImplementation(() => {});
        await mongoose.connect(process.env.MONGO_URL);
        request = supertest(app);
        testUser = await User.create({
            name: 'tester',
            email: 'tester@gmail.com',
            password: bcrypt.hashSync('password', 10),
            phone: '12345678',
            address: 'test address 123',
            answer: 'some sport'
        });

        const login = await request
        .post('/api/v1/auth/login')
        .send({
            email: 'tester@gmail.com',
            password: 'password',
        });

        authToken = login.body.token;
    });

    afterAll(async () => {
        await User.findByIdAndDelete(testUser._id);
        await mongoose.disconnect();
    });

    describe('testing /api/v1/auth/profile', () => {
        it('should update profile with valid data', async () => {
            const response = await supertest(app)
            .put('/api/v1/auth/profile')
            .set('Authorization', authToken)
            .send({
                name: 'Updated Name',
                phone: '87654321',
                address: 'updated address 123',
            });

            expect(response.status).toBe(200);
            expect(response.body.updatedUser.name).toBe('Updated Name');
            expect(response.body.message).toBe('Profile Updated Successfully');
            const dbUser = await User.findById(testUser._id);
            expect(dbUser.name).toBe('Updated Name');
            expect(dbUser.phone).toBe('87654321');
            expect(dbUser.address).toBe('updated address 123');
        });

        it('should update profile with new password', async () => {
            const response = await supertest(app)
            .put('/api/v1/auth/profile')
            .set('Authorization', authToken)
            .send({
                password: 'new password'
            });
            expect(response.status).toBe(200);
            const dbUser = await User.findById(testUser._id);
            const isPasswordMatch = await bcrypt.compare('new password', dbUser.password);
            expect(isPasswordMatch).toBe(true);

            //verify that the user can login with the new password
            const login = await request
            .post('/api/v1/auth/login')
            .send({
                email: 'tester@gmail.com',
                password: 'new password'
            });
            expect(login.status).toBe(200);
            expect(login.body.token).toBeDefined();
            expect(login.body.success).toBe(true);
        });

        it('should reject requests with invalid password', async () => {
            const response = await supertest(app)
            .put('/api/v1/auth/profile')
            .set('Authorization', authToken)
            .send({
                password: 'short'
            });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Password is required to be at least 6 characters long');
        });

        it('should reject requests with invalid phone number', async () => {
            const response = await supertest(app)
            .put('/api/v1/auth/profile')
            .set('Authorization', authToken)
            .send({
                phone: '123abc'
            });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Phone number must be numerical');
        });

        it('should reject requests for invalid token', async () => {
            const response = await supertest(app)
            .put('/api/v1/auth/profile')
            .set('Authorization', 'invalidToken')
            .send({
                name: 'new name'
            });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthorized: Invalid token');
            expect(console.log).toHaveBeenCalledWith(expect.objectContaining({
                name: 'JsonWebTokenError',
                message: 'jwt malformed'
            }));
        });

        it('should reject requests with no token', async () => {
            const response = await supertest(app)
            .put('/api/v1/auth/profile')
            .send({
                name: 'new name'
            });

            expect(response.status).toBe(401);
            expect(response.body.message).toBeUndefined();
        });
    })
})