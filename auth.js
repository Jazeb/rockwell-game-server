const { verifyToken } = require('./utils/shared');

const authenticateToken = async(req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401);
    
    const user = await verifyToken(token);
    if (!user) return res.sendStatus(401);
    req.user = user;
    return next();
}

module.exports = authenticateToken;