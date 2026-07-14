import { Router } from "express";
import { validate } from "../../common/middleware/validate.middleware";
import { customerController } from "./customer.controller";
import { createCustomerSchema, updateCustomerSchema } from "@invoice/shared";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import { authorize } from "../../common/middleware/authorize.middleware";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all customers
router.get(
  "/",
  authorize("ADMIN"),
  customerController.getAllCustomers,
);

// Get single customer
router.get(
  "/:id",
  authorize("ADMIN"),
  customerController.getCustomerById,
);

// Create customer
router.post(
  "/",
  authorize("ADMIN"),
  validate(createCustomerSchema),
  customerController.createCustomer,
);

// Update customer
router.put(
  "/:id",
  authorize("ADMIN"),
  validate(updateCustomerSchema),
  customerController.updateCustomer,
);

// Delete customer
router.delete(
  "/:id",
  authorize("ADMIN"),
  customerController.deleteCustomer,
);

export { router as customerRouter };