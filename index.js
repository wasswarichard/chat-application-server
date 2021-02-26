const http = require('http');
const socketio = require('socket.io');
const {addUser, removeUser, getUser, getUsersInRoom ,postMessage, getRoomMessages, loginUser, postUser} = require('./controllers/chat');

const server = http.createServer((req, res) => {
    const { method, url, headers } = req;
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin' : '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE'
    });
    switch (method){
        case 'POST':
            switch (url){
                case '/login':
                    try{
                        req.on('data', (chuck) => {
                            const requestData = JSON.parse(chuck.toString());
                            loginUser(requestData)
                                .then(response => {
                                    return res.end(JSON.stringify(response))
                                })
                                .catch(error =>{
                                    return res.end(error);
                                })
                        });
                        return ;
                    } catch (error){
                        return res.end(JSON.stringify({error}));
                    }
                case '/create':
                    try{
                        req.on('data', (chunk) =>{
                         const postData = JSON.parse(chunk.toString());
                         postUser(postData)
                             .then(response => {
                                 return res.end(JSON.stringify(response))
                             })
                             .catch(error => {
                                 return res.end(error);
                             })
                        });
                        return ;
                    } catch (error){
                        return res.end(JSON.stringify({error}));
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

const port = process.env.PORT || 5000;
server.listen(port, ()=> console.log(`Backend Server running on http://localhost:${port}`));