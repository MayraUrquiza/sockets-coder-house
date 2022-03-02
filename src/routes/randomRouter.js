import { Router } from "express";
import RandomController from "../controllers/randomController.js";

const routerRandom = Router();
const randomController = new RandomController();

routerRandom.get("/", randomController.getRandomsNonBlocking);
routerRandom.get("/blocking/", randomController.getRandomsBlocking);

export default routerRandom;
