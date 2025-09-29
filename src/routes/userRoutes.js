const express = require('express');
const { getAllUsers } = require('../handlers/userHandler');

const router = express.Router();

router.get('/users', getAllUsers);

module.exports = router;
