const express = require('express');
const { registerUser } = require('../handlers/userHandler');
const { verifyAccount } = require('../handlers/verifyAccountHandler');

const router = express.Router();

router.post('/register', registerUser);
router.post('/verify', verifyAccount);

module.exports = router;
