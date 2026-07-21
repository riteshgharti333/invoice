import { Router } from "express";

import { authRouter } from "../modules/auth/auth.routes";
import { userRouter } from "../modules/users/user.routes";
import { customerRouter } from "../modules/customer/customer.routes";
import { serviceRouter } from "../modules/services/service.routes";
import { categoryRouter } from "../modules/category/category.routes";
import { quotationRouter } from "../modules/quotation/quotation.routes";
import { invoiceRouter } from "../modules/invoice/invoice.routes";
import { paymentRouter } from "../modules/payment/payment.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
  });
});

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/customer", customerRouter);
router.use("/service", serviceRouter);
router.use("/category", categoryRouter);
router.use("/quotation", quotationRouter);
router.use("/invoice", invoiceRouter);
router.use("/payment", paymentRouter);

export default router;
