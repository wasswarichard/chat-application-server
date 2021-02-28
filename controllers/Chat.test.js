process.env.NODE_ENV = 'test';

const {addUser, removeUser, getUser, getUsersInRoom ,postMessage, getRoomMessages, loginUser, postUser} = require('./chat');

test('adds user', ()=> {
    addUser({id: 34, name: "showroom", room: "test"});
});

test('get room messages', () => {
    getRoomMessages({user_room: "showroom"});
});

test('gets user', ()=> {
    getUser({id: 34});
});

test('login users', () => {
    loginUser({name: "richard", room: "showroom"})
        .then(data => {
            expect(data).toBe({});
        })
        .catch(error => {})
})

test('post user to database', () => {
    postUser({name : "richard", room: "showroom"})
        .then(response => {
           expect(response).toBe({})
        })
        .catch(error => {})
});

test('post message to database', () => {
    postMessage({user_room:"showroom", message: "test", sent_by: "test"});
});

test('remove user', ()=> {
    removeUser({id: 34});
});

test('get Users in room', ()=> {
    getUsersInRoom({room: "showroom"});
});