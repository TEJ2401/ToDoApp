/* eslint-disable react/prop-types */
import React, { useState } from "react";

function Todoitem({ todo, updateTodo, deleteTodo }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editPriority, setEditPriority] = useState(todo.priority);
  const [editDueDate, setEditDueDate] = useState(
    todo.dueDate ? todo.dueDate.split("T")[0] : ""
  );

  const handleComplete = () => {
    updateTodo(todo._id, { completed: !todo.completed });
  };

  const handleEdit = () => {
    if (isEditing) {
      updateTodo(todo._id, {
        text: editText,
        priority: editPriority,
        dueDate: editDueDate,
      });
    }
    setIsEditing(!isEditing);
  };

  const handleDelete = () => {
    deleteTodo(todo._id);
  };

  return (
    <li
      className={`todo-item ${todo.completed ? "completed" : ""} priority-${
        todo.priority
      }`}
    >
      <div className="todo-content">
        {isEditing ? (
          <>
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            />
            <select
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input
              type="date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
            />
          </>
        ) : (
          <div className="todo-details">
            <span className="todo-text">{todo.text}</span>
            <span className="priority">{todo.priority}</span>
            {todo.dueDate && (
              <span className="due-date">
                {new Date(todo.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="todo-actions">
        <button className="complete-btn" onClick={handleComplete}>
          {todo.completed ? "❌" : "✔️"}
        </button>
        <button className="edit-btn" onClick={handleEdit}>
          {isEditing ? "💾" : "✏️"}
        </button>
        <button className="delete-btn" onClick={handleDelete}>
          🗑️
        </button>
      </div>
    </li>
  );
}

export default Todoitem;
