import { Router } from "express";
import { validate } from "../../common/middleware/validate.middleware";
import { serviceController } from "./service.controller";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import { authorize } from "../../common/middleware/authorize.middleware";
import { createServiceSchema, updateServiceSchema } from "@invoice/shared";

const router = Router();

router.get("/", serviceController.getAllServices);
router.get("/search", serviceController.searchServices);
router.get("/filter", serviceController.filterServices);
router.get("/:id", serviceController.getServiceById);
router.post(
  "/",
  authorize("ADMIN"),
  validate(createServiceSchema),
  serviceController.createService,
);
router.put(
  "/:id",
  authorize("ADMIN"),
  validate(updateServiceSchema),
  serviceController.updateService,
);
router.delete("/:id", authorize("ADMIN"), serviceController.deleteService);

export { router as serviceRouter };
