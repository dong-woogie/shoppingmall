const { User } = require("../models/User");

let auth = async (req, res, next) => {
  //인증 처리를 하는 곳

  try {
    let token = req.cookies.x_auth;
    const user = await User.findByToken(token);
    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.json({
      isAuth: false,
      error: true,
    });
  }
};

module.exports = { auth };
