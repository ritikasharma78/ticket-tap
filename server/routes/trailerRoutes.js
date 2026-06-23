import express from "express";
import { getTrailers } from "../controllers/trailerController.js";

const trailerRouter = express.Router();

trailerRouter.get("/", getTrailers);

export default trailerRouter;