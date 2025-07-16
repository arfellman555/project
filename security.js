// security.js file

// Function to get API key from environment or command line
function getApiKey() {
    // Check for command line argument first (--api-key=value)
    const cmdLineArg = process.argv.find(arg => arg.startsWith('--api-key='));
    if (cmdLineArg) {
        return cmdLineArg.split('=')[1];
    }
    
    // Fall back to environment variable
    return process.env.API_KEY;
}

// Function to validate API key exists on startup
function validateApiKeyExists() {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.log("apiKey has no value. Please provide a value through the API_KEY env var or --api-key cmd line parameter.");
        process.exit(1);
    }
    return apiKey;
}

// API Key middleware function
function validateApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    const serverApiKey = getApiKey();
    
    if (!apiKey) {
        return res.status(401).send("API Key is missing");
    }
    
    if (apiKey !== serverApiKey) {
        return res.status(403).send("API Key is invalid");
    }
    
    next();
}

module.exports = { validateApiKey, validateApiKeyExists };
