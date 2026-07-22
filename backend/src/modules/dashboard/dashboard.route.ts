import { Router } from "express";
import { dashboardController } from "./dashboard.controller";

const router = Router();

router.get("/stat", dashboardController.getDashboard);
router.get("/invoice-revenue", dashboardController.getRevenue);
router.get("/invoice-status", dashboardController.getInvoiceStatus);
router.get("/payment-methods", dashboardController.getPaymentMethods);

export { router as dashboardRouter };
