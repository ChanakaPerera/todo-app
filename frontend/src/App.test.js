import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

global.fetch = jest.fn();

describe('Todo App', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders the app correctly', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });
    render(<App />);
    expect(screen.getByText(/Add a Task/i)).toBeInTheDocument();
    expect(screen.getByText(/Your Tasks/i)).toBeInTheDocument();
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  });

  test('adds a new task', async () => {
    fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] }) // Initial fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, title: 'Test Task', description: 'Test Description' })
      });

    render(<App />);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByPlaceholderText(/Title/i), { target: { value: 'Test Task' } });
    fireEvent.change(screen.getByPlaceholderText(/Description/i), { target: { value: 'Test Description' } });
    fireEvent.click(screen.getByRole('button', { name: /Add/i }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.getByText('Test Task')).toBeInTheDocument());
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  test('marks a task as done', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 1, title: 'Test Task', description: 'Test Description' }]
      }) // Initial fetch
      .mockResolvedValueOnce({ ok: true }).mockResolvedValueOnce({ 
        ok: true, 
        json: async () => [] // Refetching todos returns an empty list (task removed)
      });
    render(<App />);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByText('Test Task')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /Done/i }));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByText('Test Task')).not.toBeInTheDocument());
  });

  test('shows an error message on fetch failure', async () => {
    fetch.mockRejectedValueOnce(new Error('Failed to fetch todos'));
    render(<App />);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByText(/Failed to fetch todos/i)).toBeInTheDocument());
  });
});
