const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


// midleware

app.use(cors());
app.use(express.json())







const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1tj4s8s.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    await client.connect();
    const usersCollection = client.db('techDB').collection('users');
    const servicesCollection =client.db('techDB').collection('services')

    app.get("/users",  async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists" });
      }

      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get("/services", async(req,res)=>{
      const result =await servicesCollection.find().toArray()
      res.send(result)
    })
    
   app.get("/services/:id", async(req,res)=>{
    const id =req.params.id;
    const query ={_id : new ObjectId(id)}
    const brandDetails = await servicesCollection.findOne(query)
    res.send(brandDetails)
   })
   




    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

    //await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
  res.send('Apple server is running')
})

app.listen(port, () => {
  console.log(`apple server is running on port ${port}`)
})