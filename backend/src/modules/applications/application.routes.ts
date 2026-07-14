import { Router } from "express";
import { validate } from "../../common/middleware/validate.middleware";
import { applicationController } from "./application.controller";
import { createApplicationSchema } from "./application.validation";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import { authorize } from "../../common/middleware/authorize.middleware";

const router = Router();

// Public route - submit application (no file upload)
router.post(
  "/",
  validate(createApplicationSchema),
  applicationController.createApplication,
);

// Admin only routes
router.get(
  "/",
  authMiddleware,
  authorize("ADMIN"),
  applicationController.getAllApplications,
);
router.get(
  "/:id",
  authMiddleware,
  authorize("ADMIN"),
  applicationController.getApplicationById,
);
router.delete(
  "/:id",
  authMiddleware,
  authorize("ADMIN"),
  applicationController.deleteApplication,
);

export { router as applicationRouter };