const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/login', (req, res) => {
  const password = req.body.password;
  const email = req.body.email;
  const validUser = {
    email: "bkim123@gmail.com", 
    pass: "1234"
  }

  if (email == validUser.email && password == validUser.pass){
    res.send({
      status: "valid"
    });
  } else {
    res.send(404, {
      status: "Not Valid"
    })
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});