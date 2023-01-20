const express = require("express");
const router = express.Router();

const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

const User = require("../models/User");

router.post("/user/signup", async (req, res) => {
  try {
    const password = req.body.password;
    //console.log(password);
    const salt = uid2(16);
    //console.log(salt);
    const hash = SHA256(salt + password).toString(encBase64);
    //console.log(hash);
    const token = uid2(64);
    //console.log(token);

    const username = req.body.username;
    const emailRegistered = await User.findOne({ email: req.body.email });

    //console.log(emailRegistered);

    const newUser = new User({
      account: {
        username: req.body.username,
      },
      email: req.body.email,
      hash: hash,
      salt: salt,
      token: token,
      newsletter: req.body.newsletter,
    });

    if (!username || !email || !password || typeof newsletter !== "boolean") {
      return res.status(400).json({ message: "Missing parameter" });
    }
    //console.log(newUser);

    if (emailRegistered) {
      return res
        .status(400)
        .json({ error: { message: "This email address already exists" } });
    }

    if (!username) {
      return res.status(400).json({ message: "Please enter a username" });
    }
    await newUser.save();

    const Answer = {
      id: newUser._id,
      token: token,
      account: {
        username: req.body.username,
      },
    };

    res.json(Answer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailValidation = await User.findOne({ email: email });
    const hash = SHA256(emailValidation.salt + password).toString(encBase64);
    //console.log(hash);

    const Answer = {
      id: emailValidation._id,
      token: emailValidation.token,
      account: {
        username: emailValidation.account.username,
      },
    };
    console.log(Answer);

    if (hash !== emailValidation.hash) {
      return res.status(401).json({ error: { message: "Unauthorized" } });
    } else {
      res.json(Answer);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
