const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('mongoose');
const { Schema } = mongoose;
require('dotenv').config();
const cors = require('cors')

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.mmmu4.mongodb.net/netflix-backend?retryWrites=true&w=majority`, {
  useNewUrlParser: true, 
  useUnifiedTopology: true, 
  useCreateIndex:true,
});

const User = mongoose.model('users', new Schema({
  name: String,
  email: {
    type: String,
    required: true, 
    unique: true,
  }, 
  password: {
    type: String, 
    required: true,
  }, 

}));

app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/register', (req, res) => {
  const newUser = new User({
    name: req.body.name, 
    email: req.body.email,
    password: req.body.password
  });

  newUser.save((err, user) => {
    if (err) {
      // user already exists
      res.send(400, {
        status: err
      })
    } else {
      res.send({
        status: "Registered"
      });
    }
  })
});

app.post('/login', (req, res) => {
  const password = req.body.password;
  const email = req.body.email;

  User.findOne({
    email: email, 
    password: password
  }, (err, user) => {
    if(user) {
      res.send({
        status: "valid",
        token: user.id
      });
    } else {
      res.send(404, {
        status: "Not Valid"
      });
    };
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});