const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');
const {addUser, removeUser, getUser, getUsersInRoom ,postMessage, getRoomMessages} = require('./controllers/user');

const router = require('./routes/router');
const app = express();
const server = http.createServer(app);
const io = socketio(server);


io.on('connection', (socket) => {
    socket.on('join', ({name, room}, callback) => {
        const {error, user} = addUser({id: socket.id, name, room});
        if (error) return callback(error);

        // user admin messages
        socket.emit('message', {text: `Hi ${user.name}, welcome to the ${user.room} room `});
        socket.broadcast.to(user.room).emit('message', {text: `${user.name}, has joined`});

        socket.join(user.room);
        getRoomMessages({user_room: user.room})
            .then(messages => {
                io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room), messages});
            })
            .catch(error => {
                console.log(error)
            });
        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        postMessage({user_room: user.room, message: message, sent_by: user.name})
        io.to(user.room).emit('message', {user: user.name, text : message});
        // io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)});
        callback();

    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message', { text: `${user.name} has left`})
        }
    });
});
app.use(express.json());
app.use(cors());
app.use(router);

const port = process.env.PORT || 5000;
server.listen(port, ()=> console.log(`Backend Server running on http://localhost:${port}`));