const express = require('express');
const app =express()
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port =process.env.PORT || 5000;

// MiddleWare
app.use(cors())
app.use(express.json())


// JWT Middle Ware
const verifyJWT= (req,res,next)=>{
  const authorization=req.headers.authorization;
  if(!authorization){
    return res.status(401).send({error: true, message:'unauthorization access'})
  }
  // 
  const token=authorization.split(' ')[1]
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(error,decoded)=>{
    if(error){
      return res.status(403).send({error: true, message:'Forbidden access'})
    }
    req.decoded=decoded
    next()
  })
}


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
    const usersCollection=client.db('bistroBossDB').collection('allUsers')
    const menuCollection=client.db('bistroBossDB').collection('menu')
    const reviewCollection=client.db('bistroBossDB').collection('review')
    const cartsCollection=client.db('bistroBossDB').collection('carts')

    
    
    // Warning use VerifyJWT before usning verifyAdmin

    const verifyAdmin=async (req,res,next)=>{
      const email=req.decoded.email;
      const query={email:email}
      const user= await usersCollection.findOne(query)
      if(user?.role!=='admin'){
        return res.status(403).send({error: true, message:'Forbidden access'})
    }
   next()
}


    // Users Related API's

    // Get users
    app.get('/users', verifyJWT,verifyAdmin, async (req,res)=>{
      const result= await usersCollection.find().toArray()
      res.send(result)
    })





    app.post('/jwt', (req,res)=>{
      const user=req.body;
      const token=jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{ expiresIn: '1h' })
      res.send({token})

    })
    
    
    // Post user
    app.post('/users', async (req, res) => {
      const user=req.body
      const query={email:user.email}
      const existingUser=await usersCollection.findOne(query)
      console.log('existingUser',existingUser);
      if(existingUser){
        return res.send({message: 'user already exists'})
      }
      const result = await usersCollection.insertOne(user)
      res.send(result)
    })

    app.get('/users/admin/:email', verifyJWT, async (req,res)=>{
      const email=req.params.email
      if(req.decoded.email!==email){
        res.send({admin:false})
      }
      const query={email:email}
      const user=await usersCollection.findOne(query)
      const result ={admin: user?.role==='admin'}
      res.send(result)

    })

    app.patch('/users/admin/:id', async (req,res)=>{
      const id =req.params.id;
      const filter={_id: new ObjectId(id)}
      const updateDoc = {
        $set: {
          role: 'admin'
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
    res.send(result)
    })






    // Menu Related API's
    app.get('/menu', async (req,res)=>{
        const result=await menuCollection.find().toArray()
        res.send(result)

    })

    // Review Related API's
    app.get('/review', async (req,res)=>{
        const result=await reviewCollection.find().toArray()
        res.send(result)

    })


    // Add TO CART

    // Get Data From Database
    app.get('/carts', verifyJWT, async (req,res)=>{
      const email=req.query.email;
      console.log(email);

      if(!email){
        res.send([])
      }

      // After Verifiying JWT
      const decodedEmail=req.decoded.email
      if(email!==decodedEmail){
        return res.status(403).send({error: true, message:'Forbidden access'})
      }

      const query = { email: email };
      const result=await cartsCollection.find(query).toArray();
      res.send(result)
})


    // Get Order From Client Side
    app.post('/carts',async (req,res)=>{
      const items=req.body;
      const result=await cartsCollection.insertOne(items)
      res.send(result)

    })

    // Delete Order Food
    app.delete('/carts/:id', async (req,res)=>{
      const id=req.params.id;
      const query={_id: new ObjectId(id)}
      const result=await cartsCollection.deleteOne(query)
      res.send(result)
      console.log(result);
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