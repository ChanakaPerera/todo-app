const request = require('supertest');
const app = require('../../server');
const db = require('../../db');

// Mock console.error to prevent test output pollution
global.console.error = jest.fn();

jest.mock('../../db', () => ({
  query: jest.fn()
}));

describe('Todo Routes Unit Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/todo', () => {
    it('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/api/todo')
        .send({ description: 'Test description' });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Title is required');
    });

    it('should create a new todo', async () => {
      const mockTodo = { title: 'Test', description: 'Test desc' };
      // Mock a successful database operation
      db.query.mockImplementation((sql, params, callback) => {
        callback(null, { insertId: 1 });
      });

      const response = await request(app)
        .post('/api/todo')
        .send(mockTodo);
      
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        id: 1,
        title: 'Test',
        description: 'Test desc'
      });
      // Verify console.error wasn't called
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(new Error('DB Error'), null);
      });

      const response = await request(app)
        .post('/api/todo')
        .send({ title: 'Test' });
      
      expect(response.status).toBe(500);
      // Verify console.error was called with the expected error
      expect(console.error).toHaveBeenCalledWith('Error adding todo:', expect.any(Error));
    });
  });

  describe('GET /api/todo', () => {
    it('should fetch todos', async () => {
      const mockTodos = [
        { id: 1, title: 'Test 1', description: 'Desc 1', is_done: 0 },
        { id: 2, title: 'Test 2', description: 'Desc 2', is_done: 0 }
      ];
      
      db.query.mockImplementation((sql, callback) => {
        callback(null, mockTodos);
      });

      const response = await request(app).get('/api/todo');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTodos);
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      db.query.mockImplementation((sql, callback) => {
        callback(new Error('DB Error'), null);
      });

      const response = await request(app).get('/api/todo');
      expect(response.status).toBe(500);
      expect(console.error).toHaveBeenCalledWith('Error fetching todos:', expect.any(Error));
    });
  });

  describe('PUT /api/todo/:id/complete', () => {
    it('should mark todo as completed', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(null, { affectedRows: 1 });
      });

      const response = await request(app)
        .put('/api/todo/1/complete')
        .send();
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Todo marked as completed',
        id: '1',
        is_done: 1
      });
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should return 404 if todo not found', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(null, { affectedRows: 0 });
      });

      const response = await request(app)
        .put('/api/todo/999/complete')
        .send();
      
      expect(response.status).toBe(404);
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(new Error('DB Error'), null);
      });

      const response = await request(app)
        .put('/api/todo/1/complete')
        .send();
      
      expect(response.status).toBe(500);
      expect(console.error).toHaveBeenCalledWith('Error completing todo:', expect.any(Error));
    });
  });
});