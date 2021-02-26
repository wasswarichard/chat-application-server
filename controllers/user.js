const pool = require('../config/database');
const url  = require('url');

const users = [];

const addUser = ({id, name, room}) => {
    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();
    const existingUser = users.find((user) => user.room === room && user.name === name);
    if(existingUser){
        return {error: 'Username is taken'}
    }
    const user = {id, name, room};
    users.push(user);
    return {user}
}
const getRoomMessages = (user_room) => {
    return new Promise((resolve, reject) => {
        try{
            pool.query('SELECT * FROM room WHERE user_room = $1', [user_room.user_room], (error, results) => {
                if(error){
                    return reject(error)
                }
                return resolve(results.rows);
            })
        } catch (error){
            return reject(error)
        }
    });
};
const loginUser = async (req, res) =>{
    const Users =  await pool.query('SELECT * FROM users');
    const user =  Users.rows.filter(row => {
        return row.user_name === req.body.name
    });
    if(user.length === 0){
        return res.json({
            loginSuccess: false,
            message: "Authentication failed, username not found",
            code:401
        });
    }else{
        if(user[0].user_room !== req.body.room){
            return res.json({ loginSuccess: false, message: "Wrong chat room", code:401 });
        }
        return res.json({ loginSuccess: true, code:200});
    }
}
const postUser = async (req, res) => {
    const Users =  await pool.query('SELECT * FROM users');
    const user =  Users.rows.filter(row => {
        return row.user_room === req.body.room
    });
    if(user.length === 0 || user.length === 1){
        if(user.length === 1 && user[0].user_name === req.body.name){
            return res.json({  message: `User can not be created, username  ${req.body.name} already exits in  ${req.body.room} room`, code:400 })
        }
        await pool.query('INSERT INTO users (user_name, user_room) VALUES ($1, $2)', [req.body.name, req.body.room] );
        return res.send({
            username: req.body.name,
            room : req.body.room,
            message: `User with username  ${req.body.name} in  ${req.body.room} room has been created`,
            code:201
        });
    }else{
        return res.json({  message: `The ${req.body.room} chat room has maximum members`, code:400 })
    }
}

const postMessage =  ({user_room, message, sent_by} ) => {
    pool.query('INSERT INTO room (user_room, message, sent_by, time_stamp) VALUES ($1, $2, $3, $4)', [user_room, message, sent_by, new Date()] );
    // pool.end();
};

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);
    if(index !== 1){
        return users.splice(index, 1)[0]
    }

}

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = {addUser, removeUser, getUser, getUsersInRoom, loginUser, postUser, postMessage, getRoomMessages}