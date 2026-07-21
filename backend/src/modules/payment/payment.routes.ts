import { Router } from "express";
import { validate } from "../../common/middleware/validate.middleware";
import { paymentController } from "./payment.controller";
import { createPaymentSchema, updatePaymentSchema, updatePaymentStatusSchema } from "@invoice/shared";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import { authorize } from "../../common/middleware/authorize.middleware";

const router = Router();


router.get("/", paymentController.getAllPayments);
router.get("/search", paymentController.searchPayments);
router.get("/filter", paymentController.filterPayments);
router.get("/invoice/:invoiceId", paymentController.getPaymentsByInvoice);
router.get("/:id", authorize("ADMIN"), paymentController.getPaymentById);
router.post("/", authorize("ADMIN"), validate(createPaymentSchema), paymentController.createPayment);
router.put("/:id", authorize("ADMIN"), validate(updatePaymentSchema), paymentController.updatePayment);
router.delete("/:id", authorize("ADMIN"), paymentController.deletePayment);
router.patch("/:id/status", authorize("ADMIN"), validate(updatePaymentStatusSchema), paymentController.updatePaymentStatus);

export { router as paymentRouter };