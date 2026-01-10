const User = require('../models/User');

const logoutHandler = async (req, res) => {
    const cookies=req.cookies;
    if (!cookies?.jwt) {
        return res.sendStatus(204); // No content
    }
    const refreshToken = cookies.jwt;
    const foundUser = await User.findOne({ refreshToken: refreshToken }).exec();
    if (!foundUser) {
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'Strict', secure: true });
        res.clearCookie('accessToken', { httpOnly: true, sameSite: 'Strict', secure: true });
        return res.sendStatus(204);
    }
    foundUser.refreshToken = '';
    await foundUser.save();
    res.clearCookie('jwt', {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict'
    });
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict'
    });

    res.status(204).json({ message: 'Logged out successfully.' });
};

module.exports = { logoutHandler };