const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8kzkr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        // Collections
        const servicesCollection = client.db("noboGhor").collection("services");
        const bookingsCollection = client.db("noboGhor").collection("bookings");

        // GET all services
        app.get('/services', async (req, res) => {
            const result = await servicesCollection.find().toArray();
            res.send(result);
        });

        // GET a single service by ID
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const result = await servicesCollection.findOne({ _id: new ObjectId(id) });
            res.send(result);
        });

        // POST: Create a new booking
        app.post('/bookings', async (req, res) => {
            const bookingData = req.body;
            const result = await bookingsCollection.insertOne(bookingData);
            res.send(result);
        });

        // GET: Fetch user-specific bookings
        app.get('/bookings', async (req, res) => {
            const user_email = req.query.user_email;
            const result = await bookingsCollection.find({ user_email }).toArray();
            res.send(result);
        });

        // DELETE: Remove a booking by ID (Fixed Version)
        app.delete("/bookings/:id", async (req, res) => {
            const bookingId = req.params.id;

            try {
                const result = await bookingsCollection.deleteOne({ _id: new ObjectId(bookingId) });

                if (result.deletedCount > 0) {
                    res.json({ message: "Booking deleted successfully!", deletedCount: result.deletedCount });
                } else {
                    res.status(404).json({ message: "Booking not found" });
                }
            } catch (err) {
                res.status(500).json({ message: "Error deleting booking", error: err });
            }
        });
  

  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('nobo ghor server is running');
});

app.listen(port, () => {
    console.log(`Nobo Ghor running on port : ${port}`);
});