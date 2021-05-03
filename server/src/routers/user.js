const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const { sendWelcomeEmail, sendGoodbyeEmail } = require("../emails/account");

const router = new express.Router();

//Create a new user
router.post("/api/users", async (req, res) => {
  // console.log(req.body); //debug
  const user = new User(req.body);

  try {
    // console.log(user); //debug
    await user.save();
    //send welcome email
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();

    res.status(201).send({ user, token });
  } catch (err) {
    res.status(400).send(err);
  }
});

//Login user
router.post("/api/users/login", async (req, res) => {
  try {
    //Call a custom function
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    //Create a token and verify authentication
    const token = await user.generateAuthToken();

    //Avoid sending back sensitive data
    res.send({ user, token });
  } catch (err) {
    res.status(400).send();
  }
});

//Log out user from current session
router.post("/api/users/logout", auth, async (req, res) => {
  try {
    //Remove the token used for this current session
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.status(200).send();
  } catch (err) {
    res.status(500).send();
  }
});

//Log out from all sessions (e.g. many devices)
router.post("/api/users/logoutAll", auth, async (req, res) => {
  try {
    //Remove all tokens
    req.user.tokens = [];
    await req.user.save();
    res.status(200).send();
  } catch (err) {
    res.status(500).send();
  }
});

//Read an authenticated user profile
router.get("/api/users/me", auth, async (req, res) => {
  res.send(req.user);
});

//Update one user
router.patch("/api/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    //Need to use mongodb findById, since mongoose is bypassing "save"

    updates.forEach((update) => (req.user[update] = req.body[update]));

    await req.user.save();
    res.status(200).send(req.user);
  } catch (err) {
    res.status(400).send(err);
  }
});

//Delete User
router.delete("/api/users/me", auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.user._id);

    // if (!user) {
    //   return res.status(404).send();
    // }
    await req.user.remove();
    sendGoodbyeEmail(req.user.email, req.user.name);

    res.status(200).send(req.user);
  } catch (err) {
    res.status(500).send(err);
  }
});

//--->Upload Avatar<---

//set multer
const upload = multer({
  limts: {
    filseSize: 1000000, //1Mb
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(
        new Error("Please upload an image with format .jpg .jpeg .png")
      );
    }
    cb(undefined, true);
  },
});

//error handler
const errorHandler = (error, req, res, next) => {
  res.status(400).send({ error: error.message });
};

//post file
router.post(
  "/api/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    //Resize the image with sharp
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();

    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  errorHandler
);

//--->Delete Avatar<---
router.delete("/api/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

//--->Get an user avatar<---
router.get("/api/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }
    //set response header
    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (err) {
    res.status(404).send();
  }
});

module.exports = router;
