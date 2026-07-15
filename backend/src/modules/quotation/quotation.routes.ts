import { Router } from "express";
import { validate } from "../../common/middleware/validate.middleware";
import { quotationController } from "./quotation.controller";
import { createQuotationSchema, updateQuotationSchema, updateQuotationStatusSchema } from "@invoice/shared";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import { authorize } from "../../common/middleware/authorize.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", authorize("ADMIN"), quotationController.getAllQuotations);
router.get("/search", authorize("ADMIN"), quotationController.searchQuotations);
router.get("/filter", authorize("ADMIN"), quotationController.filterQuotations);
router.get("/:id", authorize("ADMIN"), quotationController.getQuotationById);

router.post("/", authorize("ADMIN"), validate(createQuotationSchema), quotationController.createQuotation);
router.put("/:id", authorize("ADMIN"), validate(updateQuotationSchema), quotationController.updateQuotation);
router.delete("/:id", authorize("ADMIN"), quotationController.deleteQuotation);
router.patch("/:id/status", authorize("ADMIN"), validate(updateQuotationStatusSchema), quotationController.updateQuotationStatus);

export { router as quotationRouter };