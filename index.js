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

    // await client.connect();
    const usersCollection = client.db('techDB').collection('users');
    const servicesCollection = client.db('techDB').collection('services')
    const cartCollection = client.db('techDB').collection('cart')


    app.post("/cart/add", async (req, res) => {
      try {
        const product = req.body;
        // Include the user's email or unique identifier in the product data
        product.user = req.body.user;

        const result = await cartCollection.insertOne(product);
        res.status(201).json({ message: "Product added to the cart" });
      } catch (error) {
        console.error("Error adding product to the cart:", error);
        res.status(500).json({ error: "Failed to add the product to the cart" });
      }
    });
    app.delete('/cart/:productName', async (req, res) => {
      const productName = req.params.productName;
      try {
        const query = { name: productName };
        const result = await cartCollection.deleteOne(query);
        if (result.deletedCount === 1) {
          res.status(200).send({ message: 'Product deleted from cart' });
        } else {
          res.status(404).send({ message: 'Product not found in the cart' });
        }
      } catch (error) {
        res.status(500).send({ message: 'Failed to delete the product' });
      }
    }); 


   
    app.get("/cart", async (req, res) => {
      try {
        const user = req.query.user; // Get the user's email or unique identifier from the request
        const productsInCart = await cartCollection.find({ user }).toArray();
        res.status(200).json(productsInCart);
      } catch (error) {
        console.error("Error fetching products from the cart:", error);
        res.status(500).json({ error: "Failed to fetch products from the cart" });
      }
    });



    app.get("/users", async (req, res) => {
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

    app.get("/services", async (req, res) => {
      const result = await servicesCollection.find().toArray()
      res.send(result)
    })

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const brandDetails = await servicesCollection.findOne(query)
      res.send(brandDetails)
    })

    app.post("/brands/:brandName/products", async (req, res) => {
      const brandName = req.params.brandName;
      const product = req.body;
      const query = { name: brandName };
      const brand = await servicesCollection.findOne(query);

      if (!brand) {
        return res.status(404).send({ message: "Brand not found" });
      }
      brand.products.push(product);
      const result = await servicesCollection.updateOne(query, {
        $set: { products: brand.products },
      });

      if (result.modifiedCount === 1) {
        res.status(200).send({ message: "Product added to the brand" });
      } else {
        res.status(500).send({ message: "Failed to add the product" });
      }
    });






    //   const productName = req.params.name;
    //   const updatedProductData = req.body;

    //   try {
    //     // Update the product in the database
    //     const result = await servicesCollection.updateOne(
    //       { name: productName },
    //       { $set: updatedProductData }
    //     );

    //     if (result.modifiedCount === 1) {
    //       // Product updated successfully
    //       const updatedProduct = await servicesCollection.findOne({ name: productName });
    //       res.json(updatedProduct);
    //     } else {
    //       res.status(500).send({ message: 'Failed to update the product' });
    //     }
    //   } catch (error) {
    //     res.status(500).send({ message: 'Failed to update the product' });
    //   }
    // });





    // await client.db("admin").command({ ping: 1 });
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