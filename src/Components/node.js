const express = require('express');
const mongoose = require('mongoose');


const app = express();


mongoose.connect('mongodb://localhost/todolist', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));


const todoSchema = new mongoose.Schema({
    title: String,
    checked: Boolean,
    position: Number
});

const Todo = mongoose.model('Todo', todoSchema);


app.use(express.json());

app.get('/api/todos', async (req, res) => {
    const todos = await Todo.find().sort({ position: 1 });
    res.send(todos);
});

app.post('/api/todos', async (req, res) => {
    const { title } = req.body;
    const todoCount = await Todo.countDocuments();
    const newTodo = new Todo({
        title: title,
        checked: false,
        position: todoCount
    });
    await newTodo.save();
    res.send(newTodo);
});

app.put('/api/todos/:id', async (req, res) => {
    const { id } = req.params;
    const { checked } = req.body;
    const todo = await Todo.findById(id);
    todo.checked = checked;
    await todo.save();
    res.send(todo);
});

app.put('/api/todos', async (req, res) => {
    const { todos } = req.body;
    await Promise.all(todos.map(async (todo, index) => {
        const { _id, position } = todo;
        const updatedTodo = await Todo.findById(_id);
        updatedTodo.position = index;
        await updatedTodo.save();
    }));
    res.send('OK');
});


});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
