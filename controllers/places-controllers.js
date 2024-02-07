const uuid = require("uuid");
const fs= require('fs')
const HttpError = require("../models/http-error");
const {validationResult}= require('express-validator');
const getCoordsForAddress =require("../util/location");
const Place= require('../models/placeschema');
const User= require('../models/userschema');
const { default: mongoose } = require("mongoose");

const getPlacebyId = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try{
     place= await Place.findById(placeId);
  }
  catch(err){
    const error=new HttpError('something went wrong',500);
    return next (error);
  }
  if (!place) {
    const error= new HttpError("could not find data for the given id.", 404);
    return next(error);
  }
  res.json({place:place.toObject( {getters:true})});
};

const getPlacebyUser = async (req, res, next) => {
  const userId = req.params.uid;
  let places;
  try{
     places= await Place.find({creator: userId});
  }
  catch(err){
    const error=new HttpError('something went wrong',500);
    return next (error);
  }
  
  if (!places || places.length===0) {
    return next(
      new HttpError("could not find data for the given userid.", 404)
    );
  }
  res.json({ places :places.map(place=> place.toObject({getters:true}))});
};

const createPlace = async(req, res, next) => {


  const errors= validationResult(req);
  console.log(errors);
  if(!errors.isEmpty()){
    return next( new HttpError("invalid credential.", 404));

  }
  const { title, description, address } = req.body; //const title=req.body.title
  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }
 
  const createdplace= new Place({
    title,
    description,
    address,
    location:{ lng:coordinates[0], lat:coordinates[1]},
    image: req.file.path,
    creator:req.userData.userId
  });

  let user;
  try{
    user= await User.findById(req.userData.userId);
  }catch(err){
    const error= new HttpError('creating place failed',500);
    return next(error);
  }

  if(!user){
    const error= new HttpError('could not find user for provided id',404);
    return next(error);
  }

  try{
    const sess= await mongoose.startSession();
    sess.startTransaction();
    await createdplace.save({session:sess});
    user.places.push(createdplace);
    await user.save({session:sess});
    await sess.commitTransaction();
  }
  catch(err){
    return next(err);
  }
  res.status(201).json({place:createdplace});
};

const updatePlace =async (req, res, next) => {
  const errors= validationResult(req);
  console.log(errors);
  if(!errors.isEmpty()){
    return next( new HttpError("invalid credential.", 404));

  }
  const { title, description } = req.body; //const title=req.body.title
  const placeId = req.params.pid;

  let place;
  try{
     place= await Place.findById(placeId);
  }
  catch(err){
    const error=new HttpError('something went wrong',500);
    return next (error);
  }

  if(place.creator.toString() !== req.userData.userId){
    const error=new HttpError('You are not allowed to update this place',401);
    return next (error);
  }

  place.title = title;
  place.description=description;
  try{
    await place.save();
  }
  catch(err){
    return next(err);
  }

  res.status(200).json({place:place.toObject({getters:true})});
};

const deletePlace=async(req,res,next)=>{
  const placeId = req.params.pid;
  let place;
  try{
    place=await Place.findById(placeId).populate('creator');
 }
 catch(err){
   const error=new HttpError('something went wrong',500);
   return next (error);
 }

 if(!place){
  const error=new HttpError("place not found",404);
 }
 //authorization
 if(place.creator.id !== req.userData.userId){
  const error=new HttpError('You are not allowed to delete this place',401);
  return next (error);
}

 const imagePath =place.image;
 try{
  const sess= await mongoose.startSession();
  sess.startTransaction();
  await place.deleteOne({session:sess});
  place.creator.places.pull(place);
  await place.creator.save({session:sess})
  await sess.commitTransaction();
 }catch(err){
  return next(err);
 }
 fs.unlink(imagePath, err =>{
  console.log(err)
 })
  res.status(200).json({message:"deleted the place of given pid"});

}

exports.getPlacebyId = getPlacebyId;
exports.getPlacebyUser = getPlacebyUser;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace=deletePlace;