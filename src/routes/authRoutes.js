const express = require('express');
const { registerUser } = require('../handlers/userHandler');
const router = express.Router();

router.post('/register', registerUser);

module.exports = router;