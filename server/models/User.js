const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRound = 10;
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true,
    unique: 1,
  },
  password: {
    type: String,
    minlength: 5,
  },
  role: {
    type: Number,
    default: 0,
  },
  image: String,
  token: {
    type: String,
  },
  tokenExp: {
    type: Number,
  },
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  bcrypt
    .genSalt(saltRound)
    .then((salt) => bcrypt.hash(this.password, salt))
    .then((hashPassword) => {
      this.password = hashPassword;
      next();
    })
    .catch((err) => next(err));
});

userSchema.methods.comparePassword = async function (plainPassword) {
  const isMatch = await bcrypt.compare(plainPassword, this.password);
  if (!isMatch) throw new Error("비밀번호가 틀렸습니다.");
};

userSchema.methods.generateToken = async function () {
  // const token = jwt.sign(this._id, "secretToken");
  // console.log(token);
  //jsonwebtoken을 이용해서 token생성하기
  const token = await jwt.sign(this._id.toHexString(), "secretToken");
  this.token = token;
  await this.save();
};

userSchema.statics.findByToken = async function (token) {
  const decoded = await jwt.verify(token, "secretToken");
  return this.findOne({ _id: decoded, token });
};

const User = mongoose.model("User", userSchema);

module.exports = {
  User,
};
