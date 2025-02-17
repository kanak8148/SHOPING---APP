const productModel = require('../models/productModel');
const categoryModel = require('../models/categoryModel');
const orderModel = require('../models/orderModel');
const fs = require('fs');
const slugify = require('slugify');
const dotenv = require('dotenv');
const Razorpay = require('razorpay');
const crypto = require('crypto');

dotenv.config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Use your payment processor's SDK

const razorpay = new Razorpay({
  key_id: 'YOUR_RAZORPAY_KEY_ID',
  key_secret: 'YOUR_RAZORPAY_SECRET_KEY',
});


// Create product controller
// api = http://localhost:5000/api/product/create-product
const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } = req.fields;
    const { photo } = req.files;

    switch (true) {
      case !name:
        return res.status(500).send({ error: "Name is Required" });
      case !description:
        return res.status(500).send({ error: "Description is Required" });
      case !price:
        return res.status(500).send({ error: "Price is Required" });
      case !category:
        return res.status(500).send({ error: "Category is Required" });
      case !quantity:
        return res.status(500).send({ error: "Quantity is Required" });
      // case !shipping:
      //   return res.status(500).send({ error: "shipping is Required" });
      case photo && photo.size > 1000000:
        return res.status(500).send({ error: "Photo should be less than 1MB" });
    }

    const products = new productModel({ ...req.fields, slug: slugify(name) });
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "Product Created Successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in creating product",
    });
  }
};

// Get all products controller
// api = http://localhost:5000/api/product/get-product
const getProduct = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      countTotal: products.length,
      message: "All Products",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in getting products",
      error: error.message,
    });
  }
};

// Get single product controller
// api = http://localhost:5000/api/product/get-product/:slug
const searchProduct = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");
    res.status(200).send({
      success: true,
      message: "Single Product Fetched",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting single product",
      error,
    });
  }
};

// Get product photo controller
// api = http://localhost:5000/api/product/product-photo/:pid
const productPhoto = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");
    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting photo",
      error,
    });
  }
};

// Delete product controller
// api = http://localhost:5000/api/product/delete-product/:pid
const deleteProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid).select("-photo");
    res.status(200).send({
      success: true,
      message: "Product Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting product",
      error,
    });
  }
};

// Update product controller
// api = http://localhost:5000/api/product/update-product/:pid
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } = req.fields;
    const { photo } = req.files;

    switch (true) {
      case !name:
        return res.status(500).send({ error: "Name is Required" });
      case !description:
        return res.status(500).send({ error: "Description is Required" });
      case !price:
        return res.status(500).send({ error: "Price is Required" });
      case !category:
        return res.status(500).send({ error: "Category is Required" });
      case !quantity:
        return res.status(500).send({ error: "Quantity is Required" });
      case photo && photo.size > 1000000:
        return res.status(500).send({ error: "Photo should be less than 1MB" });
    }

    const products = await productModel.findByIdAndUpdate(
      req.params.pid,
      { ...req.fields, slug: slugify(name) },
      { new: true }
    );
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "Product Updated Successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in updating product",
    });
  }
};

// filters
// api = http://localhost:5000/product-filters
const productFiltersController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await productModel.find(args);
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error WHile Filtering Products",
      error,
    });
  }
};

// product count
// api = http://localhost:5000/product-count
const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Error in product count",
      error,
      success: false,
    });
  }
};

// product list base on page
// api = http://localhost:5000//product-list/:page
const productListController = async (req, res) => {
  try {
    const perPage = 8;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error in per page ctrl",
      error,
    });
  }
};

// search product
// api = http://localhost:5000/search/:keyword
const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const resutls = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo");
    res.json(resutls);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error In Search Product API",
      error,
    });
  }
};

// similar products
// api = http://localhost:5000/related-product/:pid/:cid
const realtedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select("-photo")
      .limit(3)
      .populate("category");
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error while geting related product",
      error,
    });
  }
};

// get prdocyst by catgory
// api = http://localhost:5000/product-category/:slug
const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const products = await productModel.find({ category }).populate("category");
    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
      message: "Error While Getting products",
    });
  }
};

// Google Pay token controller (handling payment token)
const googlePayPaymentController = async (req, res) => {
  try {
    const { token, cart } = req.body; // token from Google Pay API
    let total = 0;
    cart.map((item) => {
      total += item.price;
    });

    // Use token to process payment with your payment processor
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total * 100, // Stripe expects the amount in cents (for INR, multiply by 100)
      currency: 'inr',
      payment_method_data: {
        type: 'card',
        token: token, // Token from Google Pay
      },
      confirm: true,
    });

    if (paymentIntent.status === 'succeeded') {
      const order = new orderModel({
        products: cart,
        payment: paymentIntent,
        buyer: req.user._id,
      }).save();
      res.json({ success: true });
    } else {
      res.status(500).send({ error: 'Payment failed' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: 'Payment processing error', details: error });
  }
};

// Razorpay Order Creation Endpoint
const createOrder = async (req, res) => {
  try {
      const { amount } = req.body;
      console.log('amount ===> ', amount);
      const options = {
          amount: amount * 100, // Convert to smallest currency unit (paise)
          currency: 'INR',
          receipt: `receipt_${Date.now()}`
      };
      const order = await razorpay.orders.create(options);
      console.log('order ===> ', order);
      res.json(order);
  } catch (error) {
      console.error("Error creating Razorpay order:", error);
      res.status(500).json({ message: 'Failed to create Razorpay order' });
  }
};

// Razorpay Payment Verification Endpoint
const verifyPayment = (req, res) => {
  try {
      const { order_id, payment_id, signature } = req.body;
      const generated_signature = crypto.createHmac('sha256', razorpay.key_secret)
          .update(`${order_id}|${payment_id}`)
          .digest('hex');

      if (generated_signature === signature) {
          res.json({ success: true });
      } else {
          res.status(400).json({ success: false, message: 'Payment verification failed' });
      }
  } catch (error) {
      console.error("Error verifying Razorpay payment:", error);
      res.status(500).json({ message: 'Verification error' });
  }
};

module.exports = {
  addProduct,
  getProduct,
  searchProduct,
  productPhoto,
  deleteProduct,
  updateProduct,
  productFiltersController,
  productCountController,
  productListController,
  searchProductController,
  realtedProductController,
  productCategoryController,
  googlePayPaymentController,
  createOrder,
  verifyPayment
};