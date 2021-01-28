const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('mongoose');
const { Schema } = mongoose;
require('dotenv').config();
const cors = require('cors');
const jwt = require('jsonwebtoken');

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.mmmu4.mongodb.net/netflix-backend?retryWrites=true&w=majority`, {
  useNewUrlParser: true, 
  useUnifiedTopology: true, 
  useCreateIndex:true,
});

const User = mongoose.model('users', new Schema(
  {
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

const WishlistSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "users"
    },
    movieId: Number, 
    backdrop_path: String,
    title: String
  }
);

WishlistSchema.index({ user: 1, movieId: 1}, { unique: true });

const Wishlist = mongoose.model('wishlist', WishlistSchema);

app.use(cors());

app.use(express.json());

const authenticateToken = (req, res, next) => {
  const authHeaderToken = req.headers['authorization'];
  if(!authHeaderToken) return res.sendStatus(401);
  jwt.verify(authHeaderToken, "asdfoiqwehf2390ef", (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  })
}

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/wishlist', authenticateToken, (req, res) => {

  const newWishListItem = new Wishlist({
    user: req.user.id,
    movieId: req.body.movieId, 
    backdrop_path: req.body.backdrop_path, 
    title: req.body.title
  });

  newWishListItem.save((err, wishListItem) => {
    if (err) {
      res.send(400, {
        status: err
      })
    } else {
      res.send({
        wishListItem: wishListItem, 
        status: "saved"
      })
    }
  })
});

app.get('/wishlist', authenticateToken, (req, res) => {
  Wishlist.find({ user: req.user.id },(err, docs) => {
    if (err) {
      res.send(400, {
        status: err
      })
    } else {
      res.send({
        status: "good", 
        results: docs
      })
    }
  })
})



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

const generateToken = (user) => {
  const payload = {
    id: user.id, 
    name: user.name
  }
  return jwt.sign(payload, "asdfoiqwehf2390ef", { expiresIn: '1800s' })
}

app.post('/login', (req, res) => {
  const password = req.body.password;
  const email = req.body.email;

  User.findOne({
    email: email, 
    password: password
  }, (err, user) => {
    if(user) {
      console.log(user);
      const token = generateToken(user);
      res.send({
        status: "valid",
        token: token
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