const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ message: 'Access denied. Missing session token.' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey123');
        req.user = verified; 
        next(); 
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired session token.' });
    }
    app.use(express.static(path.join(__dirname, '../client')));
};