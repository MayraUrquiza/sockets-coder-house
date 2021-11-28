import { Router } from "express";
import ProductController from '../controllers/productController.js';

const routerProducts = Router()
const productController = new ProductController()

routerProducts.get("/", productController.getProducts)
routerProducts.get("/:id", productController.getProductById)
routerProducts.post("/", productController.saveProduct)
routerProducts.put("/:id", productController.updateProduct)
routerProducts.delete("/:id", productController.deleteProduct)

export default routerProducts
