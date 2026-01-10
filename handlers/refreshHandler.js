const User = require('../models/User');
const jwt = require('jsonwebtoken');

const refreshHandler = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
        return res.sendStatus(401); // Unauthorized
    }
    const refreshToken = cookies.jwt;
    
    const foundUser = await User.findOne({ refreshToken: refreshToken }).exec();
    if (!foundUser) {
        return res.sendStatus(403); // Forbidden
    }
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if (err || decoded.username !== foundUser.username) {
                return res.sendStatus(403); // Forbidden
            }
            const accessToken = jwt.sign(
                {   "userId": foundUser._id,
                    "username": decoded.username },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            );
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                sameSite: 'strict',
                secure: true,
                maxAge: 60 * 1000
            });
        }
    );
    res.sendStatus(200);
};

module.exports = { refreshHandler };    
