const express = require('express');
const app =express()
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const port =process.env.PORT || 5000;

// MiddleWare
app.use(cors())
app.use(express.json())


// Server Home Routes
app.get('/', (req,res)=>{
    res.send('Bistro Boss in Chilling')
})


// MongoDB Start From Here

var uri = `mongodb://${process.env.BOSS_USER}:${process.env.BOSS_PASS}@ac-hbq0lk7-shard-00-00.ceweuof.mongodb.net:27017,ac-hbq0lk7-shard-00-01.ceweuof.mongodb.net:27017,ac-hbq0lk7-shard-00-02.ceweuof.mongodb.net:27017/?ssl=true&replicaSet=atlas-3rqprv-shard-0&authSource=admin&retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const menuCollection=client.db('bistroBossDB').collection('menu')
    const reviewCollection=client.db('bistroBossDB').collection('review')


    app.get('/menu', async (req,res)=>{
        const result=await menuCollection.find().toArray()
        res.send(result)

    })
    app.get('/review', async (req,res)=>{
        const result=await reviewCollection.find().toArray()
        res.send(result)

    })





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);











app.listen(port, ()=>{
    console.log(`Bistro Boss is Chilling on port${port}`);
})