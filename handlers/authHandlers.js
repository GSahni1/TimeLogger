const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const loginHandler = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }
    const foundUser = await User.findOne({
        username: username
    });
    if (!foundUser) {
        return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const refreshToken = jwt.sign(
            { "username": foundUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
    );
    foundUser.refreshToken = refreshToken;
    await foundUser.save();
    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 24 * 60 * 60 * 1000
    });
    res.redirect(302, '/dashboard');

    
};
const signupHandler = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }
    const existingUser = await User.findOne({ username: username }).exec();
    if (existingUser) {
        return res.status(409).json({ message: 'Username already taken.' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username: username,
            password: hashedPassword
        });
        await newUser.save();
        const refreshToken = jwt.sign(
            { "username": newUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );
        newUser.refreshToken = refreshToken;
        await newUser.save();
        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
            maxAge: 24 * 60 * 60 * 1000
        });
        res.redirect(302, '/dashboard');
    }catch (error) {
        res.status(500).json({ message: error.message });
    }
     
};

module.exports = { loginHandler, signupHandler };