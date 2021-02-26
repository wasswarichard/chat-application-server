const http = require('http');
// const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');
const {addUser, removeUser, getUser, getUsersInRoom ,postMessage, getRoomMessages, login} = require('./controllers/user');
const {loginUser, postUser}  = require('./controllers/user');
const  connect = require('connect');

// const router = require('./routes/routes');
// const app = express();


// routes.get('/', (req, res) => {
//     res.send('sever is up and running')
// });

// module.exports = data => {
//     return JSON.stringify(data);
// }


const app = connect()
    .use(function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000/");
    });

const server = http.createServer((req, res) => {
    // response.statusCode = 200
    const { method, url, headers } = req;
    // res.setHeader("Content-Type", "application/json");
    // res.setHeader('Access-Control-Allow-Origin', '*');
    // res.setHeader('Access-Control-Request-Method', '*');
    // res.setHeader('Access-Control-Allow-Methods', '*');
    // res.setHeader('Access-Control-Allow-Headers', '*');
    switch (method){
        case 'POST':
            // console.log(req.body);
            switch (url){
                case '/login':
                    try{
                        console.log(req);

                        return ;
                    } catch (error){
                        return;
                    }
                case '/create':
                    try{
                        return ;
                    } catch (error){
                        return
                    }
            }
            return;
        case 'GET':
           if( url === "/"){
               res.statusCode = 200;
               return  res.end(JSON.stringify({message : 'sever is up and running'}));
           }
           return ;
        default:
            res.statusCode = 400;
            return res.end(JSON.stringify({message: `Endpoint doesn't exist`}))
    }


});
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


// app.use(express.json());
// app.use(cors());
// app.use(router);

const port = process.env.PORT || 5000;
server.listen(port, ()=> console.log(`Backend Server running on http://localhost:${port}`));