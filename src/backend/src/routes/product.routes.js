import {Router} from 'express'
import productController from '../controllers/product.controllers.js'
import {authMiddleware} from '../middlewares/auth.middleware.js'

const router = Router();

// Define product routes here
router.post('/create', authMiddleware, productController.createProduct);
router.get('/', authMiddleware, productController.getProducts);

router.get('/vendor/name', authMiddleware, productController.vendorName);

// Vendor/Admin: product details by productId + full audit logs
router.get('/vendor/product/:id', authMiddleware, productController.getVendorProductDetails);

// Vendor/Admin: regenerate product QR (invalidates all previous QR codes for that product)
router.post('/regenerate-qr/:id', authMiddleware, productController.regenerateProductQr);

//Route for user to get details of a specific product using qr code
router.get('/:id', productController.getProductByQRCode); // No auth middleware here, accessible to all users. use to get info about a product by scanning QR code

router.post('/activate/:id', authMiddleware, productController.activateProduct);
router.post('/block/:id', authMiddleware, productController.blockProduct);
router.post('/delete/:id', authMiddleware, productController.deleteProduct);
router.post('/update/:id', authMiddleware, productController.updateProduct);

export default router;