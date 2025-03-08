import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import PrivateRoute from './Private';
import "@testing-library/jest-dom/extend-expect";
import { useAuth } from '../../context/auth';

jest.mock('axios');
jest.mock('../Spinner', () => () => <div>Loading...</div>);
jest.mock('../../context/auth', () => ({
  useAuth: jest.fn(() => [null, jest.fn()])
}));

describe('test PrivateRoute component', () => {
  it('renders Spinner when not authenticated', async () => {
    useAuth.mockReturnValueOnce([{
      user: null,
      token: null
    }, jest.fn()]);
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/dashboard" element={<PrivateRoute />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders Outlet when authenticated', async () => {
    useAuth.mockReturnValueOnce([{
      user: 'test-user',
      token: 'test-token'
    }, jest.fn()]);
    axios.get.mockResolvedValueOnce({ data: { ok: true } });
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/dashboard" element={<PrivateRoute />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
  });

  it('renders Spinner when authenticated but data not ok', async () => {
    useAuth.mockReturnValueOnce([{
      user: 'test-user',
      token: 'test-token'
    }, jest.fn()]);
    axios.get.mockResolvedValueOnce({ data: { ok: false } });
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/dashboard" element={<PrivateRoute />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.queryByText('Loading...')).toBeInTheDocument());
  });
});