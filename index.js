const express = require("express");
const app = express();
const port = 5000;
const mongoose = require("mongoose");
const { User } = require("./models/User");
const config = require("./config/key");

mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("mongodb connected.."))
  .catch((err) => console.log(err));

//application/x-www.form.urlencoded
app.use(express.urlencoded({ extended: true }));

//application/json
app.use(express.json());

app.get("/", (req, res) => res.send("Hello World!"));

app.post("/register", (req, res, next) => {
  const user = new User(req.body);
  user
    .save()
    .then(() => res.status(200).json({ success: true }))
    .catch((err) => res.json({ success: false, err }));
});

app.listen(port, () => console.log(`Example app listening on port ${port}`));
