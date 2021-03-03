const pool = require('../config/database');
const _ =  require('underscore')

var users = [];

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

const loginUser = (body) => {
    return new Promise((resolve, reject) => {
        try{
            pool.query('SELECT * FROM users', (error, results) => {
                if(error){
                    return reject(error);
                }
                const databaseChatroom = results.rows.filter(row => {
                    return  row.user_room === body.room;
                });
                if (databaseChatroom.length === 0) {
                    return resolve({
                        loginSuccess: false,
                        message: `Authentication failed, chatroom ${body.room} not found`,
                        code:401
                    });
                }else {
                   const databaseRoomUsers =  databaseChatroom.filter(row => {
                        return row.user_name === body.name;
                    });
                   if (databaseRoomUsers.length === 0){
                       return resolve ({
                           loginSuccess: false,
                           message: `Authentication failed, username ${body.name} not found in ${body.room} chatroom`,
                           code:401
                       })
                   }else {
                       const loggedInUser = users.filter(roomUser => {
                           return roomUser.name === body.name && roomUser.room === body.room;
                       });
                       if(loggedInUser.length  > 0){
                           return resolve({
                               loginSuccess: false,
                               message: "You are already logged in another browser instance",
                               code:201
                           });
                       }
                       return resolve({
                           loginSuccess: true,
                           code:200
                       });
                   }
                }
            })

        } catch (error) {
            return  reject(error);
        }

    })
}

const postUser = (body) => {
    return new Promise((resolve, reject) => {
        try {
            pool.query('SELECT * FROM users', (error, results) => {
                if (error)
                    return reject(error);
                const user = results.rows.filter(row => {
                    return row.user_room === body.room;
                });
                if(user.length === 0 || user.length === 1) {
                    if(user.length === 1 && user[0].user_name === body.name){
                        return resolve({
                            message: `User can not be created, username  ${body.name} already exits in  ${body.room} room`,
                            code:400
                        });
                    }
                    pool.query('INSERT INTO users (user_name, user_room) VALUES ($1, $2)', [body.name, body.room], (error, results) => {
                        if(error)
                            return reject(error);
                        return resolve({
                            username: body.name,
                            room : body.room,
                            message: `User with username  ${body.name} in  ${body.room} room has been created`,
                            code:201
                        });
                    });
                }else {
                    return resolve({
                        message: `The ${body.room} chat room has maximum members`,
                        code:400
                    });
                }
            })
        } catch (error) {
            return  reject(error);
        }
    });
}

const postMessage =  ({user_room, message, sent_by} ) => {
    pool.query('INSERT INTO room (user_room, message, sent_by, time_stamp) VALUES ($1, $2, $3, $4)', [user_room, message, sent_by, new Date()] );
    // pool.end();
};

const removeUser = (id) => {
    const removedUser = users.filter(user => {
        return  user.id === id;
    });
    users = _.without(users, _.findWhere(users, {
        id: id
    }));
    return removedUser;

}

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = {addUser, removeUser, getUser, getUsersInRoom, loginUser, postUser, postMessage, getRoomMessages}