const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

exports.signUp = async (req, res, next) => {
  const { username, password } = req.body;
  // Hash password
  const hashPassword = await bcrypt.hash(password, 12);
  try {
    const newUser = await User.create({
      username: username,
      password: hashPassword,
    });
    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(400).json({
      status: "failed",
    });
  }
};
