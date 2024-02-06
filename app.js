const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const HttpError = require("./models/http-error");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");

const placesRoutes = require("./routes/places-routes");
const userRoutes = require("./routes/users-routes");

const app = express();

app.use(cors({
  origin:[process.env.FRONTEND_URL],
  methods:["GET","POST","PATCH","DELETE"],
  credentials: true
}))


app.use(bodyParser.json());

app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE");
  next();
});

app.use("/api/places", placesRoutes);

app.use("/api/users", userRoutes);

app.use((req, res, next) => {
  throw new HttpError("invalid http request", 404);
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "unknown error occured" });
});

mongoose
  //.connect('mongodb+srv://harshita:ZK1KNcLrLwkPS9pX@cluster0.9bh9deu.mongodb.net/mern?retryWrites=true&w=majority')
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.9bh9deu.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(process.env.PORT|| 5000,()=>{
      console.log(`server is working`)
    });
  })
  .catch((err) => {
    console.log(err);
  });
//
