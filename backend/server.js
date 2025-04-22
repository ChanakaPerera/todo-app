const express = require('express')
require('dotenv').config();
const bodyParser = require('body-parser')
const cors = require('cors')
var db = require('./db');
const app = express()

app.use(bodyParser.json());
app.use(cors());

//routing path
app.get('/', (req, res) => {
    res.send('welcome todo app backend');
  });

  // Add new todo
app.post('/api/todo', (req, res) => {
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const sql = 'INSERT INTO task (title, description) VALUES (?, ?)';
    db.query(sql, [title, description], (err, result) => {
      if (err) {
        console.error('Error adding todo:', err);
        return res.status(500).json({ error: 'Failed to add todo' });
      }
      res.status(201).json({
        id: result.insertId,
        title,
        description
      });
    });
  });

  // Get most recent 5 todos
app.get('/api/todo', (req, res) => {
    const sql = 'SELECT * FROM task WHERE is_done=0 ORDER BY created_at DESC LIMIT 5';
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching todos:', err);
        return res.status(500).json({ error: 'Failed to fetch todos' });
      }
      res.json(results);
    });
  });

  //mark todo as completed
  app.put('/api/todo/:id/complete', (req, res) => {
    const todoId = req.params.id;
    const sql = 'UPDATE task SET is_done = 1 WHERE id = ?';
    
    db.query(sql, [todoId], (err, results) => {
      if (err) {
        console.error('Error completing todo:', err);
        return res.status(500).json({ error: 'Failed to complete todo' });
      }
      
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Todo not found' });
      }
      
      res.json({ 
        message: 'Todo marked as completed',
        id: todoId,
        is_done: 1 
      });
    });
  });

module.exports = app;


// Only start the server if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 1000;
  const server = app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
  
  // Handle server close for tests
  module.exports.server = server;
}