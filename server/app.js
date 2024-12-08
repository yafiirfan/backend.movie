require("dotenv").config();
const express = require("express");
const app = express();
const port = 3001;
const { User } = require("./models");
const { hash, compare } = require("./helpers/bcrypt");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary");
const cors = require("cors");
const { OAuth2Client } = require("google-auth-library");
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const multer = require("multer");
const { signToken } = require("./helpers/jwt");
const upload = multer({ storage: multer.memoryStorage() });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,

  api_key: process.env.CLOUDINARY_API_KEY,

  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/register", async (req, res, next) => {
  try {
    let { email, password, username } = req.body;
    let user = await User.create({
      username,
      email,
      password: password,
    });
    res
      .status(201)
      .json({ id: user.id, username: user.username, email: user.email });
  } catch (error) {
    next(error);
  }
});

app.post("/login", async (req, res, next) => {
  try {
    let { email, password } = req.body;
    if (!email) throw { name: "Email is required" };
    if (!password) throw { name: "Password is required" };
    let user = await User.findOne({
      where: {
        email,
      },
    });
    if (!user) throw { name: "Invalid email/password" };
    let valid = compare(password, user.password);
    if (!valid) throw { name: "Invalid email/password" };
    let access_token = jwt.sign({ id: user.id }, "secret");
    res.status(200).json({ access_token });
  } catch (error) {
    next(error);
  }
});

app.post("/google-login", async (req, res, next) => {
  try {
    console.log("goggle login server");
    const { googleToken } = req.body;
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name } = payload;
    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({
        email,
        username: name,
        password: "google-login",
      });
    }
    const access_token = signToken({ id: user.id });
    res.status(200).json({
      access_token,
    });
  } catch (err) {
    console.log("🚀 ~ UserController ~ googleLogin ~ err:", err);
    next(err);
  }
});

app.put("/user-update", authentication, async (req, res, next) => {
  try {
    console.log(req.body);
    const { username } = req.body;
    if (!username) throw { name: "Username is required" };

    const user = await User.findByPk(req.user.id);
    if (!user) throw { name: "Data not found" };

    await user.update({ username });

    res.status(200).json({
      message: "Username updated successfully",
      username: user.username,
      imageUrl: user.imageUrl,
    });
  } catch (error) {
    next(error);
  }
});

app.delete("/user-delete", authentication, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) throw { name: "Data not found" };

    await user.destroy();

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    next(error);
  }
});

app.listen(port, () => {
  console.clear();
  console.log(`The app is running on port ${port}`);
});

app.use(errorHandler);

function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message || "Internal server error";

  switch (err.name) {
    case "SequelizeValidationError":
    case "SequelizeUniqueConstraintError":
      status = 400;
      message = err.errors[0].message;
      break;
    case "Invalid Input":
    case "Email is required":
    case "Password is required":
      status = 400;
      message = err.name;
      break;
    case "Invalid email/password":
      status = 401;
      message = err.name;
      break;
    case "Invalid token":
    case "JsonWebTokenError":
      status = 401;
      message = "Invalid token";
      break;
    case "Forbidden":
      status = 403;
      message = "You are not authorized";
      break;
    case "Data not found":
    case "User not found":
      status = 404;
      message = err.name;
      break;
  }
  res.status(status).json({ message });
}

async function authentication(req, res, next) {
  try {
    if (!req.headers.authorization) throw { name: "Invalid token" };
    let [type, token] = req.headers.authorization.split(" ");
    if (type !== "Bearer") throw { name: "Invalid token" };
    let payload = jwt.verify(token, "secret");
    if (!payload) throw { name: "Invalid token" };
    let user = await User.findByPk(payload.id);
    if (!user) throw { name: "Invalid token" };
    req.user = {
      id: user.id,
    };
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = app;
