const request = require('supertest');
const app = require('../../server');
const db = require('../../db');

describe('Todo API Integration Tests', () => {
  beforeAll(async () => {
    // Setup test database
    await db.promise().query(`
      CREATE TABLE IF NOT EXISTS task (
        id INT NOT NULL AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description VARCHAR(255),
        is_done INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      )
    `);
  });

  beforeEach(async () => {
    // Clear the table before each test
    await db.promise().query('TRUNCATE TABLE task');
  });

  afterAll(async () => {
    // Close the database connection
    await db.end();
  });

  it('should create, fetch, and complete a todo', async () => {
    // Create a new todo
    const createResponse = await request(app)
      .post('/api/todo')
      .send({ title: 'Integration Test', description: 'Test Description' });
    
    expect(createResponse.status).toBe(201);
    const todoId = createResponse.body.id;

    // Verify the todo exists
    const getResponse = await request(app).get('/api/todo');
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.some(todo => todo.id === todoId)).toBeTruthy();

    // Mark as completed
    const completeResponse = await request(app)
      .put(`/api/todo/${todoId}/complete`);
    expect(completeResponse.status).toBe(200);

    // Verify it's no longer in active todos
    const getAfterComplete = await request(app).get('/api/todo');
    expect(getAfterComplete.status).toBe(200);
    expect(getAfterComplete.body.some(todo => todo.id === todoId)).toBeFalsy();
  });
});