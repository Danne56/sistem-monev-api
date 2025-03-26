const express = require('express');
const { registerUser } = require('../handlers/userHandler');
const { verifyAccount } = require('../handlers/verifyAccountHandler');
const { loginUser } = require('../handlers/loginHandler');

const router = express.Router();

router.post('/register', registerUser);
router.post('/verify', verifyAccount);
router.post('/login', loginUser);

module.exports = router;
