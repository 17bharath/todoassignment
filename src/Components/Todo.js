import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';

const Todo = () => {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');

  useEffect(() => {
    getTodos();
  }, []);

  const getTodos = async () => {
    const res = await axios.get('/todos');
    setTodos(res.data);
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    const res = await axios.post('/todos', { title, link });
    setTodos([...todos, res.data]);
    setTitle('');
    setLink('');
  };

  const handleCheckTodo = async (id) => {
    const todoIndex = todos.findIndex(todo => todo._id === id);
    const todoToUpdate = { ...todos[todoIndex], checked: !todos[todoIndex].checked };
    const res = await axios.patch(`/todos/${id}`, todoToUpdate);
    setTodos([...todos.slice(0, todoIndex), res.data, ...todos.slice(todoIndex + 1)]);
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    const [reorderedItem] = todos.splice(sourceIndex, 1);
    todos.splice(destIndex, 0, reorderedItem);

    const res = await axios.patch(`/todos/${reorderedItem._id}`, { position: destIndex });
    setTodos([...todos]);
  };

  return (
    <div>
      <form onSubmit={handleAddTodo}>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="text" value={link} onChange={(e) => setLink(e.target.value)} />
        <button type="submit">Add Todo</button>
      </form>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="todos">
          {(provided) => (
            <ul {...provided.droppableProps} ref={provided.innerRef}>
              {todos.map((todo, index) => (
                <Draggable key={todo._id} draggableId={todo._id} index={index}>
                  {(provided) => (
                    <li
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      ref={provided.innerRef}
                      style={{ textDecoration: todo.checked ? 'line-through' : 'none' }}
                    >
                      <input type="checkbox" checked={todo.checked} onChange={() => handleCheckTodo(todo._id)} />
                      <span>{todo.title}</span>
                      <a href={todo.link}>Link</a>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default Todo;
