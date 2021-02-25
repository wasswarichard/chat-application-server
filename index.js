const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const {Pool, Client} = require('pg');
const cors = require('cors');
const {addUser, removeUser, getUser, getUsersInRoom } = require('./controllers/user');




const router = require('./routes/router');


const app = express();
const server = http.createServer(app);
const io = socketio(server);


io.on('connection', (socket) => {
    socket.on('join', ({name, room}, callback) => {
        const {error, user} = addUser({id: socket.id, name, room});
        if (error) return callback(error);
        socket.emit('message', {text: `${user.name}, welcome to the ${user.room} room `});
        socket.broadcast.to(user.room).emit('message', {text: `${user.name}, has joined`})
        socket.join(user.room);

        io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)});
        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('message', {user: user.name, text : message});
        io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)});
        callback();

    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message', { text: `${user.name} has left`})
        }
    });
});
app.use(cors());
app.use(router);

const port = process.env.PORT || 5000;
server.listen(port, ()=> console.log(`Backend Server running on http://localhost:${port}`));