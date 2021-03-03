const http = require('http');
const {addUser, removeUser, getUser, getUsersInRoom ,postMessage, getRoomMessages, loginUser, postUser} = require('./controllers/chat');

const server = http.createServer((req, res) => {
    const { method, url, headers } = req;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    const urlString = url.split('?')[0];
    const queryString  = new URLSearchParams(url.split('?')[1]);

    switch (method){
        case 'POST':
            switch (urlString){
                case '/login':
                    try{
                        loginUser( {name : queryString.get('name'), room: queryString.get('room')})
                            .then(response => {
                                res.statusCode = 200;
                                return res.end(JSON.stringify(response))
                            })
                            .catch(error =>{
                                return res.end(error);
                            });
                        return ;
                    } catch (error){
                        return res.end(JSON.stringify({error}));
                    }
                case '/create':
                    try{
                        postUser({name : queryString.get('name'), room: queryString.get('room')})
                            .then(response => {
                                res.statusCode = 200;
                                return res.end(JSON.stringify(response))
                            })
                            .catch(error => {
                                return res.end(error);
                            })
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

const io = require('socket.io')(server, {
    cors: {
        // origin: "http://localhost:3000"
        origin: "*"
    }
});
io.on('connection', (socket) => {
    socket.on('join', ({name, room}, callback) => {
        const {error, user} = addUser({id: socket.id, name, room});
        if (error) return callback(error);
        socket.join(user.room);
        getRoomMessages({user_room: user.room})
            .then(messages => {
                socket.emit('roomData', {room: user.room, users: getUsersInRoom(user.room), messages});
                socket.emit('message', {text: `Hi ${user.name}, welcome to the ${user.room} room `});
            })
            .catch(error => {
                callback(error);
            });

        socket.broadcast.to(user.room).emit('message', {text: `${user.name}, has joined`});
        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        postMessage({user_room: user.room, message: message, sent_by: user.name})
        io.to(user.room).emit('message', {user: user.name, text : message});
        callback();

    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if(user.length > 0){
            socket.broadcast.to(user[0].room).emit('message', {text: `${user[0].name}, has left`});
        }
    });
});

const port = process.env.PORT || 5000;
server.listen(port, ()=> console.log(`Backend Server running on http://localhost:${port}`));
process.on('uncaughtException', (error) => {
    console.error(error.message);
});
module.exports = server