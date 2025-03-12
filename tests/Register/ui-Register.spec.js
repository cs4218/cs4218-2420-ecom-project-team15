import { test, expect } from '@playwright/test';
import dotenv from "dotenv";
import mongoose from 'mongoose';
import userModel from '../../models/userModel'

dotenv.config();

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/register');
});

test('Renders page', async ({ page }) => {
  await expect(page.getByRole('main')).toContainText('REGISTER FORM');
});

test('able to fill out form and register new user', async ({ page }) => {
  const project = test.info().project.name;

  const userEmail = `johndoe${project}@gmail.com`;

  // remove mock user if exists
  try {
    await mongoose.connect(process.env.MONGO_URL);
    await userModel.deleteOne({ email: userEmail });
    await mongoose.connection.close();
  } catch (error) {
    console.log(`Error in Mongodb ${error}`);
  }
  // fill in details
  await page.getByRole('textbox', { name: 'Enter Your Name' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('John Doe');
  await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(userEmail);
  await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('password');
  await page.getByRole('textbox', { name: 'Enter Your Phone' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('98765432');
  await page.getByRole('textbox', { name: 'Enter Your Address' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('Main St 1');
  await page.getByPlaceholder('Enter Your DOB').fill('2000-01-01');
  await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).click();
  await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill('Football');

  // check that details are displayed correctly
  await expect(page.getByRole('textbox', { name: 'Enter Your Name' })).toHaveValue('John Doe');
  await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toHaveValue(userEmail);
  await expect(page.getByRole('textbox', { name: 'Enter Your Password' })).toHaveValue('password');
  await expect(page.getByRole('textbox', { name: 'Enter Your Phone' })).toHaveValue('98765432');
  await expect(page.getByRole('textbox', { name: 'Enter Your Address' })).toHaveValue('Main St 1');
  await expect(page.getByPlaceholder('Enter Your DOB')).toHaveValue('2000-01-01');
  await expect(page.getByRole('textbox', { name: 'What is Your Favorite sports' })).toHaveValue('Football');
  
  // submit form
  await page.getByRole('button', { name: 'REGISTER' }).click();
  await page.waitForURL('http://localhost:3000/login');

  // test login
  await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(userEmail);
  await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('password');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await page.waitForURL('http://localhost:3000/');
  await expect(page.url()).toBe('http://localhost:3000/');

  // test logout
  await page.getByRole('button', { name: 'John Doe' }).click();
  await page.getByRole('link', { name: 'Logout' }).click();
  await page.waitForURL('http://localhost:3000/login');
  await expect(page.url()).toBe('http://localhost:3000/login');

  // remove mock user if exists
  try {
    await mongoose.connect(process.env.MONGO_URL);
    await userModel.deleteOne({ email: userEmail });
    await mongoose.connection.close();
  } catch (error) {
    console.log(`Error in Mongodb ${error}`);
  }
});

test('should not be able to create user with duplicate email', async ({ page }) => {
  const project = test.info().project.name;

  const userEmail = `johndoe${project}duplicate@gmail.com`;

  // create a user with the same email
  try {
    await mongoose.connect(process.env.MONGO_URL);
    await userModel.create({
      name: 'John Doe',
      email: userEmail,
      password: 'hashedpassword',
      phone: '98765432',
      address: 'Main St 1',
      dob: '2000-01-01',
      answer: 'Football',
    });
    await mongoose.connection.close();
  } catch (error) {
    console.log(`Error in Mongodb ${error}`);
  }

  // fill in details of new user with same email
  await page.getByRole('textbox', { name: 'Enter Your Name' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('Jane Doe');
  await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(userEmail);
  await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('password123');
  await page.getByRole('textbox', { name: 'Enter Your Phone' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('98765433');
  await page.getByRole('textbox', { name: 'Enter Your Address' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('Main St 2');
  await page.getByPlaceholder('Enter Your DOB').fill('2000-01-02');
  await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).click();
  await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill('Basketball');

  // check that details are displayed correctly
  await expect(page.getByRole('textbox', { name: 'Enter Your Name' })).toHaveValue('Jane Doe');
  await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toHaveValue(userEmail);
  await expect(page.getByRole('textbox', { name: 'Enter Your Password' })).toHaveValue('password123');
  await expect(page.getByRole('textbox', { name: 'Enter Your Phone' })).toHaveValue('98765433');
  await expect(page.getByRole('textbox', { name: 'Enter Your Address' })).toHaveValue('Main St 2');
  await expect(page.getByPlaceholder('Enter Your DOB')).toHaveValue('2000-01-02');
  await expect(page.getByRole('textbox', { name: 'What is Your Favorite sports' })).toHaveValue('Basketball');
  
  // submit form
  await page.getByRole('button', { name: 'REGISTER' }).click();

  // verify that the error has occured and user was not created
  await expect(page.getByRole('status')).toContainText('Something went wrong');
  await expect(page.getByRole('main')).toContainText('REGISTER FORM');

  // attempt to login
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(userEmail);
  await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('password123');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await expect(page.getByRole('status')).toContainText('Something went wrong');
  await expect(page.getByRole('main')).toContainText('LOGIN FORM');

  // remove mock user if exists
  try {
    await mongoose.connect(process.env.MONGO_URL);
    await userModel.deleteOne({ email: userEmail });
    await mongoose.connection.close();
  } catch (error) {
    console.log(`Error in Mongodb ${error}`);
  }
});