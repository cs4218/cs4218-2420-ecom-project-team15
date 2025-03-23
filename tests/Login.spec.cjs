import { test, expect } from '@playwright/test';
import dotenv from "dotenv";
import mongoose from 'mongoose';
import userModel from '../models/userModel'

dotenv.config();

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/login');
});

test('Renders page', async ({ page }) => {
  await expect(page.getByRole('main')).toContainText('LOGIN FORM');
});

test('Login with unknown user', async ({ page }) => {
  const project = test.info().project.name;
  const userEmail = `johndoe${project}loginunknown@gmail.com`

  // fill in details
  await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(userEmail);
  await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('password');
  await page.getByRole('button', { name: 'LOGIN' }).click();

  // verify that the error has occured and the user is still on the login page
  await expect(page.getByRole('status')).toContainText('Something went wrong');
  await expect(page.getByRole('main')).toContainText('LOGIN FORM');
});

test('Login with known user', async ({ page }) => {
  const project = test.info().project.name;
  const userEmail = `johndoe${project}login@gmail.com`

  // create a user
  try {
    await mongoose.connect(process.env.MONGO_URL);
    await userModel.create({
      name: 'John Doe',
      email: userEmail,
      password: '$2b$10$Ji6nod1KaK6s5P/35R8jiu1KlzsQI4io61sCptHuq7jnHN/WAkY8W', // hashed password of 'password'
      phone: '98765432',
      address: 'Main St 1',
      dob: '2000-01-01',
      answer: 'Football',
    });
    await mongoose.connection.close();
  } catch (error) {
    console.log(`Error in Mongodb ${error}`);
  }

  // fill in details
  await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(userEmail);
  await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('password');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await page.waitForURL('http://localhost:3000/');
  await expect(page.url()).toBe('http://localhost:3000/');

  // remove mock user
  try {
    await mongoose.connect(process.env.MONGO_URL);
    await userModel
      .deleteOne({ email: userEmail });
    await mongoose.connection.close();
  } catch (error) {
    console.log(`Error in Mongodb ${error}`);
  }
});

test('Login with wrong password', async ({ page }) => {
  const project = test.info().project.name;
  const userEmail = `johndoe${project}login@gmail.com`

  // create a user
  try {
    await mongoose.connect(process.env.MONGO_URL);
    await userModel.create({
      name: 'John Doe',
      email: userEmail,
      password: '$2b$10$Ji6nod1KaK6s5P/35R8jiu1KlzsQI4io61sCptHuq7jnHN/WAkY8W', // hashed password of 'password'
      phone: '98765432',
      address: 'Main St 1',
      dob: '2000-01-01',
      answer: 'Football',
    });
    await mongoose.connection.close();
  } catch (error) {
    console.log(`Error in Mongodb ${error}`);
  }

  // fill in details
  await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(userEmail);
  await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('wrongpassword');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await expect(page.getByRole('status')).toContainText('Something went wrong');
  await expect(page.url()).toBe('http://localhost:3000/login');

  // remove mock user
  try {
    await mongoose.connect(process.env.MONGO_URL);
    await userModel
      .deleteOne({ email: userEmail });
    await mongoose.connection.close();
  } catch (error) {
    console.log(`Error in Mongodb ${error}`);
  }
});
