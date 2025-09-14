const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = req.cookies.token

    console.log("at token validation : ",token)

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired jwt token !' });
        }
        req.userId = user.userId;
        req.user = user;
        next();
    });
};

module.exports = { authenticateToken };
