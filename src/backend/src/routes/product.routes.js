import {Router} from 'express'
import productController from '../controllers/product.controllers.js'
import authMiddleware from '../middlewares/auth.middleware.js'

const router = Router();

// Define product routes here
router.post('/create', authMiddleware, productController.createProduct);
router.get('/', authMiddleware, productController.getProducts);


export default router;