// server.js file
const express = require('express');
const path = require('path');  // for handling file paths
const da = require("./data-access");  // data access module
const bodyParser = require('body-parser');  // for parsing JSON request bodies
const { validateApiKey, validateApiKeyExists } = require('./security');  // import API key middleware

const app = express();
const port = process.env.PORT || 4000;  // use env var or default to 4000

// Validate API key exists on startup
validateApiKeyExists();

app.use(bodyParser.json());  // middleware to parse JSON bodies

// Set the static directory to serve files from
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

app.get("/customers", validateApiKey, async (req, res) => {
     const [cust, err] = await da.getCustomers();
     if(cust){
         res.send(cust);
     }else{
         res.status(500);
         res.send(err);
     }   
});

app.post('/customers', validateApiKey, async (req, res) => {
    const newCustomer = req.body;
    if (!newCustomer || Object.keys(newCustomer).length === 0) {
        res.status(400);
        res.send("missing request body");
    } else {
        // return array format [status, id, errMessage]
        const [status, id, errMessage] = await da.addCustomer(newCustomer);
        if (status === "success") {
            res.status(201);
            let response = { ...newCustomer };
            response["_id"] = id;
            res.send(response);
        } else {
            res.status(400);
            res.send(errMessage);
        }
    }
});

app.get("/customers/find", async (req, res) => {
    // Check if query string exists
    const queryKeys = Object.keys(req.query);
    if (queryKeys.length === 0) {
        return res.send("query string is required");
    }
    
    // Check if only one query parameter is provided
    if (queryKeys.length > 1) {
        return res.send("only single name/value pair allowed");
    }
    
    const queryKey = queryKeys[0];
    const queryValue = req.query[queryKey];
    
    // Check if the query key is one of the allowed properties
    const allowedKeys = ['id', 'email', 'password'];
    if (!allowedKeys.includes(queryKey)) {
        return res.send("name must be one of the following (id, email, password)");
    }
    
    // Convert id to number if searching by id
    let searchValue = queryValue;
    if (queryKey === 'id') {
        searchValue = +queryValue;
    }
    
    // Search for customers
    const [customers, err] = await da.findCustomers({[queryKey]: searchValue});
    if (err) {
        return res.status(500).send(err);
    }
    
    if (!customers || customers.length === 0) {
        return res.send("no matching customer documents found");
    }
    
    res.send(customers);
});

app.get("/customers/:id", validateApiKey, async (req, res) => {
     const id = req.params.id;
     // return array [customer, errMessage]
     const [cust, err] = await da.getCustomerById(id);
     if(cust){
         res.send(cust);
     }else{
         res.status(404);
         res.send(err);
     }   
});

app.put('/customers/:id', validateApiKey, async (req, res) => {
    const id = req.params.id;
    const updatedCustomer = req.body;
    if (!updatedCustomer || Object.keys(updatedCustomer).length === 0) {
        res.status(400);
        res.send("missing request body");
    } else {
        delete updatedCustomer._id;
        // return array format [message, errMessage]
        const [message, errMessage] = await da.updateCustomer(id, updatedCustomer);
        if (message) {
            res.send(message);
        } else {
            res.status(404);
            res.send(errMessage);
        }
    }
});

app.delete("/customers/:id", validateApiKey, async (req, res) => {
    const id = req.params.id;
    // return array [message, errMessage]
    const [message, errMessage] = await da.deleteCustomerById(id);
    if (message) {
        res.send(message);
    } else {
        res.status(404);
        res.send(errMessage);
    }
});

app.get("/reset", async (req, res) => {
    const [result, err] = await da.resetCustomers();
    if(result){
        res.send(result);
    }else{
        res.status(500);
        res.send(err);
    }   
});