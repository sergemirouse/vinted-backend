const express = require("express");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const router = express.Router();

const isAuthenticated = require("../middlewares/isAuthenticated");
const convertToBase64 = require("../utils/convertToBase64");

const Offer = require("../models/Offer");

router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      // console.log(req.user);

      const { title, description, price, brand, size, condition, color, city } =
        req.body;

      const picture = req.files.picture;
      const result = await cloudinary.uploader.upload(convertToBase64(picture));

      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          { MARQUE: brand },
          { TAILLE: size },
          { ETAT: condition },
          { COULEUR: color },
          { EMPLACEMENT: city },
        ],
        owner: req.user,
        product_image: result,
      });

      await newOffer.save();
      console.log(newOffer);

      res.json(newOffer);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

router.get("/offers", async (req, res) => {
  try {
    const { title, priceMin, priceMax, sort, page } = req.query;

    const filters = {};

    if (title) {
      filters.product_name = new RegExp(title, "i");
    }

    if (priceMin) {
      filters.product_price = { $gte: Number(priceMin) };
    }

    if (priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = Number(priceMax);
      } else {
        filters.product_price = { $gte: Number(priceMax) };
      }
    }

    const sortFilter = {};

    if (sort === "price-asc") {
      sortFilter.product_price = "asc";
    } else if (sort === "price-desc") {
      sortFilter.product_price = "desc";
    }

    const limit = 5;

    let pageRequired = 1;
    if (page) pageRequired = Number(page);

    const skip = (pageRequired - 1) * limit;

    const offers = await Offer.find(filters)
      .sort(sortFilter)
      .skip(skip)
      .limit(limit)
      .populate("owner", "account");

    const count = await Offer.countDocuments(filters);

    const response = {
      count: count,
      offers: offers,
    };

    res.json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate(
      "owner",
      "account"
    );

    res.json(offer);
  } catch (error) {}
});

module.exports = router;
