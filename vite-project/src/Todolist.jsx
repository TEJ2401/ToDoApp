/* eslint-disable react/prop-types */
// TodoItemList Component
import React from "react";
import Todoitem from "./Todoitem"; // Importing the TodoItem component
import "./Todoitem.css"; // Import the CSS file

function Todolist({ todos, updateTodo, deleteTodo }) {
  return (
    <div className="todo-list-wrapper">
      <div className="todo-header">
        <span className="header-task">Task</span>
        <span className="header-priority">Priority</span>
        <span className="header-due-date">Due Date</span>
        <span className="header-actions">Actions</span>
      </div>
      <ul className="todo-list">
        {todos.map((todo) => (
          <Todoitem
            key={todo._id}
            todo={todo}
            updateTodo={updateTodo}
            deleteTodo={deleteTodo}
          />
        ))}
      </ul>
    </div>
  );
}

export default Todolist;
