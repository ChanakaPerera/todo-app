import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = process.env.REACT_APP_API_URL;

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL,{method:'GET', headers: {
        'Content-Type': 'application/json',
      }});
      if (!response.ok) throw new Error('Failed to fetch todos');
      const data = await response.json();
      setTodos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (title.trim() === '') return;

    try {
      setLoading(true);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) throw new Error('Failed to add todo');

      const newTodo = await response.json();
      if(todos.length<5){
        setTodos([newTodo,...todos]);
      }
     
      setTitle('');
      setDescription('');
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDone = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/${id}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) throw new Error('Failed to update todo');

await fetchTodos();
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="left-panel">
        <h2>Add a Task</h2>
        <form onSubmit={handleAddTodo}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <button type="submit" className="add-button" disabled={loading}>
            {loading ? 'Adding...' : 'Add'}
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
      
      <div className="right-panel">
        <h2>Your Tasks</h2>
        {loading && todos.length === 0 ? (
          <p>Loading tasks...</p>
        ) : todos.length === 0 ? (
          <p className="empty-state">No tasks yet. Add one above!</p>
        ) : (
          <div className="todos-container">
            {todos.map(todo => (
              <div key={todo.id} className="todo-container">
                <h3>{todo.title}</h3>
                <p>{todo.description}</p>
                <button 
                  onClick={() => handleDone(todo.id)}
                  className="done-button"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Done'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;