const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const cookieParser = require('cookie-parser');

const { loginHandler, signupHandler } = require('./handlers/authHandlers');
const { refreshHandler } = require('./handlers/refreshHandler');
const { logoutHandler } = require('./handlers/logoutHandler');
const connectDB = require('./config/dbConn');
connectDB();

const app = express();
const port = process.env.PORT || 3000;

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'));
});
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/signup.html'));
});
app.post('/login', loginHandler);
app.post('/signup', signupHandler);
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/dashboard.html'));
});
app.post('/refresh', refreshHandler);
app.use('/api', require('./routes/apiRoutes'));
app.post('/logout', logoutHandler);

app.listen(port);