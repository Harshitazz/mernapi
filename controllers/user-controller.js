const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const User = require("../models/userschema");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt =require('jsonwebtoken')

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    const error = new HttpError("fetching users failed, try again later", 500);
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const Signup = async (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    return next(new HttpError("invalid input.", 404));
  }
  const { name, email, password } = req.body;

  let existinguser;
  try {
    existinguser = await User.findOne({ email: email });
  } catch (err) {
    return next(err);
  }

  if (existinguser) {
    const error = new HttpError("user exist already,please login", 422);
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(err)
  }
  const createduser = new User({
    name,
    email,
    image: req.file.path,
    password:hashedPassword,
    places: [],
  });

  try {
    await createduser.save();
  } catch (err) {
    return next(err);
  }
//token
  let token;
  try{
    token= jwt.sign({
        userId:createduser.id ,email: createduser.email
      },process.env.JWT_KEY,{expiresIn:'1h'})
  }catch(err){
    return next(err)
  }
 
  res.status(201).json({ userId: createduser.id ,email:createduser.email ,token:token  });
};

const Login = async (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    throw new HttpError("invalid input.", 404);
  }
  const { email, password } = req.body;
  let loggeduser;
  try {
    loggeduser = await User.findOne({ email: email });
  } catch (err) {
    return next(err);
  }
  
  if (!loggeduser ) {
    return next(
      new HttpError("unable to identify user,credential may be wrong", 401)
    );
  }
  let isvalidPassword= false;
  try{
    isvalidPassword= await bcrypt.compare(password,loggeduser.password)
  }catch(err){
    const error= new HttpError('try again later',500);
  }
  if(!isvalidPassword){
    return next(
        new HttpError("unable to identify user,credential may be wrong", 401)
      );
  }
  let token;
  try{
    token= jwt.sign({
        userId:loggeduser.id ,email: loggeduser.email
      },process.env.JWT_KEY,{expiresIn:'1h'})
  }catch(err){
    return next(err)
  }

  res.json({ userId:loggeduser.id, email: loggeduser.email, token:token });
};

exports.getUsers = getUsers;
exports.Signup = Signup;
exports.Login = Login;
