// security.js file
// API Key middleware function
function validateApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
        return res.status(401).send("API Key is missing");
    }
    
    if (apiKey !== process.env.API_KEY) {
        return res.status(403).send("API Key is invalid");
    }
    
    next();
}

module.exports = { validateApiKey };
