const express = require("express");
const app = express();
const fs = require("fs");
const bodyParser = require("body-parser");
const port = 3000;
// const queryString = require("query-string");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/api/v1/todos", (req, res) => {
  const query = req.query.per_page || 4;
  const todos = fs.readFileSync("./dev-data/todos.json", "utf8");

  try {
    const listTodo = JSON.parse(todos);

    const todo = listTodo.splice(0, query);

    if (listTodo) {
      return res.status(200).send({
        status: "success",
        result: listTodo.length,
        data: todo,
      });
    }
  } catch (error) {
    res.send({ error });
  }
});

// Lấy một bản ghi theo id
app.get("/api/v1/todos/:id", (req, res) => {
  const { id } = req.params;
  try {
    const todos = fs.readFileSync("./dev-data/todos.json", "utf8");

    const listTodo = JSON.parse(todos);

    const todo = listTodo.find((data) => data.id === +id);

    if (todo) {
      return res.status(200).send({
        status: "success",
        data: todo,
      });
    } else {
      return res.status(404).send({
        status: "Toto not found",
      });
    }
  } catch (error) {
    res.send({ error });
  }
});

// Xóa một bản ghi theo id
app.delete("/api/v1/todos/:id", (req, res) => {
  const { id } = req.params;
  try {
    const todos = fs.readFileSync("./dev-data/todos.json", "utf8");

    let listTodo = JSON.parse(todos);

    const todoIndex = listTodo.findIndex((data) => data.id === +id);

    if (todoIndex !== -1) {
      listTodo.splice(todoIndex, 1);
      fs.writeFile("./dev-data/todos.json", JSON.stringify(listTodo), (err) => {
        if (err) {
          return res.status(500).json({
            status: "error",
            message: "An error occurred while deleting the todo",
          });
        }
        return res.status(200).json({
          status: "success",
          message: "Todo deleted successfully",
        });
      });
    } else {
      return res.status(404).json({
        status: "error",
        message: "Todo not found",
      });
    }
  } catch (error) {
    res.send({ error });
  }
});

app.delete("/api/v1/todos/", (req, res) => {
  try {
    const empty = [];

    fs.writeFile("./dev-data/todos.json", JSON.stringify(empty), (err) => {
      return res.status(200).json({
        status: "success",
        message: "Todo deleted successfully",
      });
    });
  } catch (error) {
    res.send({ error });
  }
});

const checkExist = (req, res, next) => {
  const { title } = req.body;

  const todos = JSON.parse(fs.readFileSync("./dev-data/todos.json", "utf8"));

  // Kiểm tra theo title
  const todoTitle = todos.find((todo) => todo.title === title);
  if (todoTitle) {
    return res.status(400).json({ message: "Todo already exists" });
  }

  next();
};

app.post("/api/v1/todos", checkExist, (req, res) => {
  const { title } = req.body;
  try {
    const todos = JSON.parse(fs.readFileSync("./dev-data/todos.json", "utf8"));

    const id = Math.floor(Math.random() * 10000000000000000);
    const newTodo = {
      id: id,
      userId: id,
      title: title,
      completed: false,
    };
    todos.push(newTodo);
    fs.writeFileSync("./dev-data/todos.json", JSON.stringify(todos));
    return res.status(200).send({
      status: "success",
      message: "Todos added successfully",
    });
  } catch (error) {
    res.send({ error });
  }
});

app.put("/api/v1/todos/:id", checkExist, (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  try {
    const todos = JSON.parse(fs.readFileSync("./dev-data/todos.json", "utf8"));

    const findTodo = todos.findIndex((todo) => todo.id == +id);
    console.log(findTodo);
    if (findTodo === -1) {
      res.status(404).send({
        message: "Todo not found",
      });
    } else {
      todos[findTodo] = {
        ...todos[findTodo],
        title,
        completed,
      };

      fs.writeFileSync("./dev-data/todos.json", JSON.stringify(todos));
      return res.status(200).send({
        status: "success",
        message: "Todos added successfully",
      });
    }
  } catch (error) {
    res.send({ error });
  }
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/html/todo.html");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
