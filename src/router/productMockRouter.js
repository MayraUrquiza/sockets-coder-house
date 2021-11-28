import { Router } from "express";
import ProductMockController from "../controllers/productMockController.js";

const routerProductsMock = Router()
const productMockController = new ProductMockController()

routerProductsMock.get("/", productMockController.getProducts)

export default routerProductsMock;
