const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const auth = require("../middleware/auth");
const Todo = require("../models/Todo");
const router = express.Router();

module.exports = function (io) {
  // Get all todos for a user
  router.get("/", auth, async (req, res) => {
    try {
      const todos = await Todo.find({ user: req.user.id }).sort({
        createdAt: -1,
      });
      res.json(todos);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Create a new todo
  router.post("/", auth, async (req, res) => {
    const { text, priority, dueDate } = req.body;

    const todo = new Todo({
      text,
      priority,
      dueDate,
      user: req.user.id,
    });

    try {
      const newTodo = await todo.save();
      res.status(201).json(newTodo);
      io.emit("addTodo", { message: "HI" });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  // Update a todo
  router.put("/:id", auth, async (req, res) => {
    try {
      const todo = await Todo.findOne({
        _id: req.params.id,
        user: req.user.id,
      });
      if (!todo) return res.status(404).json({ message: "Todo not found" });

      if (req.body.text != null) todo.text = req.body.text;
      if (req.body.completed != null) todo.completed = req.body.completed;
      if (req.body.priority != null) todo.priority = req.body.priority;
      if (req.body.dueDate != null) todo.dueDate = req.body.dueDate;

      const updatedTodo = await todo.save();

      res.json(updatedTodo);
      io.emit("todoUpdated", { length: updatedTodo.length() });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  // Delete a todo
  router.delete("/:id", auth, async (req, res) => {
    try {
      const todo = await Todo.findOneAndDelete({
        _id: req.params.id,
        user: req.user.id,
      });
      if (!todo) return res.status(404).json({ message: "Todo not found" });
      res.json({ message: "Todo deleted" });
      io.emit("deletetodo", req.user.id);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Search and filter todos
  router.get("/search", auth, async (req, res) => {
    const { query, completed, priority } = req.query;

    let searchCriteria = { user: req.user.id };

    if (query) {
      searchCriteria.text = { $regex: query, $options: "i" };
    }

    if (completed !== undefined) {
      searchCriteria.completed = completed === "true";
    }

    if (priority) {
      searchCriteria.priority = priority;
    }

    try {
      const todos = await Todo.find(searchCriteria).sort({ createdAt: -1 });
      res.json(todos);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  return router;
};
