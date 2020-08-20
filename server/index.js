const express = require("express");
const app = express();
const port = 5000;
const mongoose = require("mongoose");
const { User } = require("./models/User");
const config = require("../config/key");
const cookieParser = require("cookie-parser");
const { auth } = require("./middleware/auth");
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

app.use(cookieParser());

app.get("/", (req, res) => res.send("Hello World!"));

app.post("/register", (req, res, next) => {
  const user = new User(req.body);
  user
    .save()
    .then(() => res.status(200).json({ success: true }))
    .catch((err) => res.json({ success: false, err }));
});

app.post("/login", async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) throw new Error("해당 유저가 없습니다.");
    await user.comparePassword(req.body.password);
    await user.generateToken();

    res
      .cookie("x_auth", user.token)
      .status(200)
      .json({ loginSuccess: true, userId: user._id });
  } catch (err) {
    res.json({ success: false, err: err.message });
  }
});

app.post("/logout", auth, async (req, res) => {
  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    { token: "" },
    { new: true }
  );
  res
    .clearCookie("x_auth")
    .status(200)
    .json({ logout: true, token: user.token });
});

app.get("/auth", auth, async (req, res, next) => {
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

app.get("/api/hello", (req, res) => {
  res.send("hello woogie~?");
});

app.listen(port, () => console.log(`Example app listening on port ${port}`));
