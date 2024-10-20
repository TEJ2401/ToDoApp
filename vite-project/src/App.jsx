import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import { Toaster, toast } from "react-hot-toast";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
} from "react-router-dom";
import "./App.css";
import Todoform from "./Todoform";
import Todolist from "./Todolist";
import Authform from "./Authform";

function App() {
  const [todos, setTodos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCompleted, setFilterCompleted] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [socket, setSocket] = useState(null);
  const [token, setToken] = useState("");
  const notifySuccess = () => {
    toast.success("Todo updated successfully!", {
      duration: 1000,
      position: "top-right",
    });
  };

  const options = {
    "force new connection": true,
    reconnectionAttempt: "Infinity",
    timeout: 10000,
    transports: ["websocket"],
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      fetchTodos();
      const newSocket = io("http://localhost:5000", options);

      newSocket.on("connect", () => {
        console.log("Connected to server");
      });
      newSocket.on("addTodo", () => {
        toast.success("Task Added Successfully!", {
          duration: 4000,
          position: "top-right",
        });
      });
      newSocket.on("todoUpdated", (data) => {
        console.log("TASK UPDATED", data);
        toast.success("Task Updated Successfully!", {
          duration: 4000,
          position: "top-right",
        }); // Call the toast notification here
        fetchTodos(); // Optionally refresh the todo list on update
      });
      newSocket.on("deletetodo", () => {
        toast.error("Task Deleted Successfully!", {
          duration: 4000,
          position: "top-right",
        });
      });
      setSocket(newSocket);

      // Clean up on unmount
      return () => {
        newSocket.disconnect();
      };
    }
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/todos", {
        headers: { "x-auth-token": localStorage.getItem("token") },
      });
      setTodos(response.data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  const addTodo = async (text, priority, dueDate) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/todos",
        { text, priority, dueDate },
        { headers: { "x-auth-token": localStorage.getItem("token") } }
      );
      setTodos((prevTodos) => [...prevTodos, response.data]);
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const updateTodo = async (id, updates) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/todos/${id}`,
        updates,
        { headers: { "x-auth-token": localStorage.getItem("token") } }
      );
      setTodos((prevTodos) =>
        prevTodos.map((todo) => (todo._id === id ? response.data : todo))
      );
      // Emit event after updating the todo
      if (socket) {
        socket.emit("todoUpdated", { id }); // Optionally send the updated todo ID to the server
      }
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/todos/${id}`, {
        headers: { "x-auth-token": localStorage.getItem("token") },
      });
      setTodos((prevTodos) => prevTodos.filter((todo) => todo._id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/todos/search`,
        {
          params: {
            query: searchQuery,
            completed: filterCompleted,
            priority: filterPriority,
          },
          headers: { "x-auth-token": localStorage.getItem("token") },
        }
      );
      setTodos(response.data);
    } catch (error) {
      console.error("Error searching todos:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");

    if (socket) {
      socket.disconnect(); // Disconnect socket on logout
    }
    setTodos([]);
  };

  function LoginWrapper() {
    const navigate = useNavigate();

    const handleLogin = async (email, password) => {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/users/login",
          { email, password }
        );
        localStorage.setItem("token", response.data.token);
        setToken();
        fetchTodos();
        navigate("/todos");
      } catch (error) {
        console.error("Login error:", error);
      }
    };

    const handleRegister = async (username, email, password) => {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/users/register",
          { username, email, password }
        );
        console.log(response.data);
        navigate("/login", { state: { fromRegister: true } });
      } catch (error) {
        console.error("Registration error:", error);
      }
    };

    return <Authform onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <Router>
      <div className="App">
        <Toaster />
        <Routes>
          <Route path="/login" element={<LoginWrapper />} />
          <Route
            path="/todos"
            element={
              localStorage.getItem("token") ? (
                <>
                  <h1>Todo List</h1>
                  <button className="logout-btn" onClick={handleLogout}>
                    Logout
                  </button>
                  <div className="search-container">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search todos"
                      className="search-input"
                    />
                    <select
                      value={filterCompleted}
                      onChange={(e) => setFilterCompleted(e.target.value)}
                      className="filter-select"
                    >
                      <option value="">All</option>
                      <option value="true">Completed</option>
                      <option value="false">Incomplete</option>
                    </select>
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="filter-select"
                    >
                      <option value="">All Priorities</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <button className="search-btn" onClick={handleSearch}>
                      Search
                    </button>
                  </div>
                  <Todoform addTodo={addTodo} />
                  <Todolist
                    todos={todos}
                    updateTodo={updateTodo}
                    deleteTodo={deleteTodo}
                  />
                </>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
