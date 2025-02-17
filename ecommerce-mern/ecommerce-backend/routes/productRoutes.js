const express = require('express');
const {
  addProduct,
  deleteProduct,
  getProduct,
  searchProduct,
  productPhoto,
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
} = require('../controllers/productController');
const { isAdmin, requireSignIn } = require('../middlewares/authMiddleware');
const formidable = require('express-formidable');

const router = express.Router();

//routes
router.post(
  "/create-product",
  requireSignIn,
  isAdmin,
  formidable(),
  addProduct
);
//routes
router.put(
  "/update-product/:pid",
  requireSignIn,
  isAdmin,
  formidable(),
  updateProduct
);

//get products
router.get("/get-product", getProduct);

//single product
router.get("/get-product/:slug", searchProduct);

//get photo
router.get("/product-photo/:pid", productPhoto);

//delete rproduct
router.delete("/delete-product/:pid", deleteProduct);

// product filters
router.post("/product-filters", productFiltersController);

//product count
router.get("/product-count", productCountController);

//product per page
router.get("/product-list/:page", productListController);

//search product
router.get('/search/:keyword', searchProductController);

//similar product
router.get('/related-product/:pid/:cid', realtedProductController);

//category wise product
router.get('/product-category/:slug', productCategoryController);

router.post('/googlepay/payment', googlePayPaymentController);

router.post('/razorpay/create-order', createOrder);

router.post('/razorpay/verify', verifyPayment);


module.exports = router;
