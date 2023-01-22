const express = require("express");
const router = express.Router();

const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

const User = require("../models/User");

router.post("/user/signup", async (req, res) => {
  try {
    const { username, email, password, newsletter } = req.body;

    if (!username || !email || !password || typeof newsletter !== "boolean") {
      return res.status(400).json({ message: "Missing parameter" });
    }

    const salt = uid2(16);
    const hash = SHA256(salt + password).toString(encBase64);
    const token = uid2(64);

    const emailRegistered = await User.findOne({ email });

    //console.log(emailRegistered);

    const newUser = new User({
      account: {
        username: req.body.username,
      },
      email: req.body.email,
      hash,
      salt,
      token,
      newsletter: req.body.newsletter,
    });

    if (emailRegistered) {
      return res
        .status(400)
        .json({ error: { message: "This email address already exists" } });
    }

    await newUser.save();

    const answer = {
      id: newUser._id,
      token: token,
      account: {
        username: newUser.account,
        token: newUser.token,
      },
    };

    res.json(answer);
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
