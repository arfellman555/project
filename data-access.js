// data-access.js file
const MongoClient = require('mongodb').MongoClient;
const dbName = 'custdb';
const baseUrl = "mongodb://127.0.0.1:27017";
const collectionName = "customers"
const connectString = baseUrl + "/" + dbName; 
let collection;

async function dbStartup() {
    const client = new MongoClient(connectString);
    await client.connect();
    collection = client.db(dbName).collection(collectionName);
}

async function getCustomers() {
     try {
         const customers = await collection.find().toArray();
         // throw {"message":"an error occured"};
         return [customers, null];
     } catch (err) {
         console.log(err.message);
         return [null, err.message];
     }
}

async function addCustomer(newCustomer) {
    try {
        // Check if a customer with the same email already exists
        const existingCustomer = await collection.findOne({"email": newCustomer.email});
        if (existingCustomer) {
            // return array [status, id, errMessage]
            return ["fail", null, "Customer with this email already exists"];
        }
        
        const insertResult = await collection.insertOne(newCustomer);
        // return array [status, id, errMessage]
        return ["success", insertResult.insertedId, null];
    } catch (err) {
        console.log(err.message);
        return ["fail", null, err.message];
    }
}

async function getCustomerById(id) {
    try {
        const customer = await collection.findOne({"id": +id});
        // return array [customer, errMessage]
        if(!customer){
          return [ null, "invalid customer number"];
        }
        return [customer, null];
    } catch (err) {
        console.log(err.message);
        return [null, err.message];
    }
}

async function updateCustomer(id, updatedCustomer) {
    try {
        const filter = { "id": +id };
        const setData = { $set: updatedCustomer };
        const updateResult = await collection.updateOne(filter, setData);
        
        // Check if any document was actually updated
        if (updateResult.matchedCount === 0) {
            return [null, "customer not found"];
        }
        
        // return array [message, errMessage]
        return ["one record updated", null];
    } catch (err) {
        console.log(err.message);
        return [null, err.message];
    }
}

async function deleteCustomerById(id) {
    try {
        const deleteResult = await collection.deleteOne({ "id": +id });
        if (deleteResult.deletedCount === 0) {
            // return array [message, errMessage]
            return [null, "no record deleted"];
        } else if (deleteResult.deletedCount === 1) {
            return ["one record deleted", null];
        } else {
            return [null, "error deleting records"]
        }
    } catch (err) {
        console.log(err.message);
        return [null, err.message];
    }
}

async function resetCustomers() {
    let data = [{ "id": 0, "name": "Mary Jackson", "email": "maryj@abc.com", "password": "maryj" },
    { "id": 1, "name": "Karen Addams", "email": "karena@abc.com", "password": "karena" },
    { "id": 2, "name": "Scott Ramsey", "email": "scottr@abc.com", "password": "scottr" }];

    try {
        await collection.deleteMany({});
        await collection.insertMany(data);
        const customers = await collection.find().toArray();
        const message = "data was refreshed. There are now " + customers.length + " customer records!"
        return [message, null];
    } catch (err) {
        console.log(err.message);
        return [null, err.message];
    }
}

async function findCustomers(filter) {
    try {
        const customers = await collection.find(filter).toArray();
        // return array [customers, errMessage]
        return [customers, null];
    } catch (err) {
        console.log(err.message);
        return [null, err.message];
    }
}

dbStartup();
module.exports = { getCustomers, resetCustomers, addCustomer, getCustomerById, updateCustomer, deleteCustomerById, findCustomers };

