const { Router } = require("express")
const { ProductController } = require("../controllers/productController")

const routerProducts = Router()
const productController = new ProductController()

routerProducts.get("/", productController.getProducts)
routerProducts.get("/:id", productController.getProductById)
routerProducts.post("/", productController.saveProduct)
routerProducts.put("/:id", productController.updateProduct)
routerProducts.delete("/:id", productController.deleteProduct)

exports.routerProducts = routerProducts
