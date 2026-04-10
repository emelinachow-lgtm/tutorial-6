import { useState, useEffect, useRef } from 'react';
import { Trash2, Plus, Check, Edit2 } from 'lucide-react';
import './TodoApp.css';

const API_URL = 'http://127.0.0.1:8000';

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const editInputRef = useRef(null);

  // Load todos from the API once when the app first mounts
  useEffect(() => {
    fetch(`${API_URL}/todos`)
      .then(response => response.json())
      .then(data => setTodos(data));
  }, []);

  // Auto-focus the edit input when editingId changes
  useEffect(() => {
    if (editingId !== null && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  // Update document title whenever todos change
  useEffect(() => {
    const pending = todos.filter(t => !t.completed).length;
    document.title = `Checked (${pending})`;
  }, [todos]);

  const addTodo = async () => {
    if (input.trim()) {
      const newTodo = {
        id: Date.now(),
        text: input.trim(),
        completed: false
      };
      const res = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTodo)
      });
      const created = await res.json();
      setTodos([...todos, created]);
      setInput('');
    }
  };

  const toggleTodo = async (id) => {
    const todo = todos.find(t => t.id === id);
    const updated = { ...todo, completed: !todo.completed };
    const res = await fetch(`${API_URL}/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    const data = await res.json();
    setTodos(todos.map(t => t.id === id ? data : t));
  }
  
  const deleteTodo = async (id) => {
    await fetch(`${API_URL}/todos/${id}`, { method: 'DELETE' });
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditingText(todo.text);
  };

  const saveEdit = async (id) => {
    const todo = todos.find(t => t.id === id);
    const updated = { ...todo, text: editingText };
    const res = await fetch(`${API_URL}/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    const data = await res.json();
    setTodos(todos.map(t => t.id === id ? data : t));
    setEditingId(null);
    setEditingText('');
  };

  return (
    <div className="app-container">
      <div className="app-wrapper">
        <div className="header">
          <h1 className="header-title">My Tasks</h1>
          <p className="header-subtitle">Stay organized and productive</p>
        </div>

        <div className="input-section">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            placeholder="What needs to be done?"
            className="todo-input"
          />
          <button onClick={addTodo} className="add-button">
            <Plus size={20} />
            Add
          </button>
        </div>

        <div className="todo-list">
          {todos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <p>No tasks yet. Add one above!</p>
            </div>
          ) : (
            <ul className="todo-items">
              {todos.map((todo) => (
                <li key={todo.id} className="todo-item">
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`checkbox ${todo.completed ? 'checkbox-completed' : ''}`}
                  >
                    {todo.completed && <Check size={16} className="check-icon" />}
                  </button>

                  {editingId === todo.id ? (
                    <>
                      <input
                        ref={editInputRef}
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(todo.id)}
                        className="todo-input"
                      />
                      <button onClick={() => saveEdit(todo.id)} className="add-button">Save</button>
                      <button onClick={() => setEditingId(null)} className="delete-button">Cancel</button>
                    </>
                  ) : (
                    <>
                      <span className={`todo-text ${todo.completed ? 'todo-completed' : ''}`}>
                        {todo.text}
                      </span>
                      <button onClick={() => startEdit(todo)} className="edit-button">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => deleteTodo(todo.id)} className="delete-button">
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {todos.length > 0 && (
          <div className="stats">
            <span>{todos.filter(t => !t.completed).length} tasks remaining</span>
          </div>
        )}
      </div>
    </div>
  );
}