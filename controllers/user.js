const pool = require('../config/database');
const url  = require('url');
// const _ = require('underscore');

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

const postUser = async (req, res) => {
    const Users =  await pool.query('SELECT * FROM users');
    const url_parts =  url.parse(req.url);
    const query = url_parts.query;
    const search_words =  [];
    query && query.split('&').forEach(value => search_words.push(value.split('=')[1]));
    const user =  Users.rows.filter(row => {
        return row.user_room === search_words[1]
    });

    if(user.length === 0 || user.length === 1){
        if(user.length === 1 && user[0].user_name === search_words[0]){
            return res.json({  message: `User can not be created, username  ${search_words[0]} already exits in  ${search_words[1]} room` })
        }
        await pool.query('INSERT INTO users (user_name, user_room) VALUES ($1, $2)', [search_words[0], search_words[1]] );
        return res.send({
            username: search_words[0],
            room : search_words[1],
            message: `User with username  ${search_words[0]} in  ${search_words[1]} room has been created`
        });
    }else{
        return res.json({  message: `The ${search_words[1]} chat room has maximum members` })
    }
}

const getMessage = async (req, res) => {
    const id = parseInt(req.params.id);
    const response = await pool.query('SELECT * FROM messages WHERE id = $1', [id]);
    res.json(response.rows);
};

const loginUser = async (req, res) =>{
    const Users =  await pool.query('SELECT * FROM users');
    const url_parts =  url.parse(req.url);
    const query = url_parts.query;
    const search_words =  [];
    query && query.split('&').forEach(value => search_words.push(value.split('=')[1]));
    const user =  Users.rows.filter(row => {
       return row.user_name === search_words[0]
    });

    console.log(Users.rows);
    if(user.length === 0){
        return res.json({
            loginSuccess: false,
            message: "Authentication failed, username not found"
        });
    }else{
        if(user[0].user_room !== search_words[1]){
            return res.json({ loginSuccess: false, message: "Wrong chat room" });
        }
        return res.json({ loginSuccess: true});
    }
}
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);
    if(index !== 1){
        return users.splice(index, 1)[0]
    }

}

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = {addUser, removeUser, getUser, getUsersInRoom, loginUser, postUser}