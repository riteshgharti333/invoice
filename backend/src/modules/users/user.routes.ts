import { Router } from "express";

import { validate } from "../../common/middleware/validate.middleware";
import { userController } from "./user.controller";
import { createUserSchema, updateUserSchema } from "./user.validation";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import { authorize } from "../../common/middleware/authorize.middleware";

const router = Router();

router.get("/", userController.getAllUsers);

router.get("/:id", userController.getUserById);

router.post("/", validate(createUserSchema), userController.createUser);

router.patch(
  "/:id",
  authMiddleware,
  validate(updateUserSchema),
  userController.updateUser,
);

router.delete(
  "/:id",
  authMiddleware,
  authorize("ADMIN"),
  userController.deleteUser,
);

export { router as userRouter };
