const express = require('express');
const router = express.Router();
const {loginUser, postUser}  = require('../controllers/user')


router.get('/', (req, res) => {
    res.send('sever is up and running')
});

router.post('/login', loginUser);

router.post('/create', postUser);

module.exports = router;