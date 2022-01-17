import { Router } from "express";
import InfoController from "../controllers/infoController.js";

const routerInfo = Router();
const infoController = new InfoController();

routerInfo.get("/info", infoController.getInfo);

export default routerInfo;
