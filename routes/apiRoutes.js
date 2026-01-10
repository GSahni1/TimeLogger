const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Habit = require('../models/Habit');
const Log = require('../models/Log');

router.get('/me', (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Failed to authenticate token' });
        try {
            const foundUser = await User.findOne({username: decoded.username}).select('-password -refreshToken');
            if (!foundUser) return res.status(404).json({ message: 'User not found' });
            res.json(foundUser);
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    });
});
router.get('/habits', (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json({ message: 'No token provided' });
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Failed to authenticate token' });
        try {
            const habits = await Habit.find({ user: decoded.userId });
            res.json(habits);
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    });
});
router.get('/logs', (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json({ message: 'No token provided' });
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Failed to authenticate token' });
        const habitId = req.query.habit;
        const limit = parseInt(req.query.limit) || 20;
        try {
            const logs = await Log.find({ user: decoded.userId, habit: habitId })
                                  .sort({ createdAt: -1 })
                                  .limit(limit);
            res.json(logs);
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    });
});
router.post('/habits', (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json({ message: 'No token provided' });
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Failed to authenticate token' });
        const { title, description } = req.body;
        try {
            const newHabit = new Habit({ user: decoded.userId, title, description });
            await newHabit.save();
            res.status(201).json(newHabit);
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    });
});
router.post('/logs', (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json({ message: 'No token provided' });
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Failed to authenticate token' });
        const { habitId, note } = req.body;
        try {
            const newLog = new Log({ user: decoded.userId, habit: habitId, note });
            await newLog.save();
            res.status(201).json(newLog);
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    });
});

module.exports = router;