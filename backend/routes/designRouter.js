import express from "express";
import { uploadDesign } from "../controllers/designController.js";
import upload from "../middlewares/multer.js";
import { userAuth } from "../middlewares/userAuth.js";
import { route } from "../lib/http.js";

const designRouter = express.Router();

// /api/design/upload
designRouter.post(
  "/upload",
  userAuth,
  upload.single("design"),
  route(uploadDesign, { status: 201, message: "Design uploaded successfully" })
);

export default designRouter;
