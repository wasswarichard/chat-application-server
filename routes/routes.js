const express = require('express');
const routes = express.Router();
const {loginUser, postUser}  = require('../controllers/user')


routes.get('/', (req, res) => {
    res.send('sever is up and running')
});

routes.post('/login', loginUser);

routes.post('/create', postUser);

module.exports = routes;