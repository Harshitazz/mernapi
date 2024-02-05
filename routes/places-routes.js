const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const fileUpload = require("../middleware/file-upload");
const placescontrollers = require("../controllers/places-controllers");
const checkAuth = require('../middleware/check-auth');

router.get("/:pid", placescontrollers.getPlacebyId);

router.get("/user/:uid", placescontrollers.getPlacebyUser);

router.use(checkAuth);

router.post(
  "/",
  fileUpload.single('image'),
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  placescontrollers.createPlace
);

router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  placescontrollers.updatePlace
);

router.delete("/:pid", placescontrollers.deletePlace);

module.exports = router;
