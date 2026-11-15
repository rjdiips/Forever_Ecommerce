import express from "express";
import { uploadDesign } from "../controllers/designController.js";
import { MAX_DESIGN_BYTES } from "../lib/design.js";
import { createUpload } from "../middlewares/multer.js";
import { designUploadRateLimit } from "../middlewares/rateLimit.js";
import { userAuth } from "../middlewares/userAuth.js";
import { route } from "../lib/http.js";

const designRouter = express.Router();

// The same 2 MB the controller enforces, but at the parser, so an oversized
// body is refused while it streams instead of after it is in memory.
const designUpload = createUpload({
  maxFileSize: MAX_DESIGN_BYTES,
  maxFiles: 1,
});

// /api/design/upload
designRouter.post(
  "/upload",
  userAuth,
  designUploadRateLimit,
  designUpload.single("design"),
  route(uploadDesign, { status: 201, message: "Design uploaded successfully" })
);

export default designRouter;
