const express = require("express");
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const cors = require("cors");
const bp = require("body-parser");
const pool = require("./db");
const hardware = require("./hardware");
//const { Socket } = require("dgram");
http.listen(3000,()=>{
  console.log('listen 3000');
});



//middleware
app.use(cors());
app.use(express.json()); //req.body


//ROUTES//

app.set('view engine','ejs');
app.use(bp.urlencoded({extended:true}));

app.get('/', async (req,res)=>{
  res.sendFile(__dirname+'/index.html');
  
  
});



io.on('connection', (client)=>{
  console.log('Client connected..');
  client.on('join',(data)=>{
    console.log(data);
  });
  setInterval(async()=>{
    try {
        const numinout = await pool.query("SELECT workspaceid, sum(num_in_out) AS suminout FROM hardware GROUP BY workspaceid");
        io.sockets.emit('hardware',numinout.rows);
        console.log(numinout.rows);
    } catch (err) {
        console.error(err.message);
    }
  },15000);
});

//create a todo

app.post("/todos", async (req, res) => {
  try {
    const { description } = req.body;
    const newTodo = await pool.query(
      "INSERT INTO hardware (description) VALUES($1) RETURNING *",
      [description]
    );

    res.json(newTodo.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

//get all todos

app.get("/todos", async (req, res) => {
  try {
    const allTodos = await pool.query("SELECT * FROM hardware");
    res.json(allTodos.rows);
  } catch (err) {
    console.error(err.message);
  }
});

pool.on('notification', async (data) => {
  const payload = JSON.parse(data.payload);
  console.log('row added', payload)
});

//get a todo

app.get("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await pool.query("SELECT * FROM hardware WHERE camid = $1", [
      id
    ]);

    res.json(todo.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

//update a todo

app.put("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    const updateTodo = await pool.query(
      "UPDATE hardware SET num_in_out = $1 WHERE camid = $2",
      [description, id]
    );

    res.json("Todo was updated!");
  } catch (err) {
    console.error(err.message);
  }
});

//delete a todo

app.delete("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleteTodo = await pool.query("DELETE FROM hardware WHERE camid = $1", [
      id
    ]);
    res.json("Todo was deleted!");
  } catch (err) {
    console.log(err.message);
  }
});

/*app.listen(5000, () => {
  console.log("server has started on port 5000");
});*/

module.exports = app;