import { Router } from "express";
import { validate } from "../../common/middleware/validate.middleware";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import { authorize } from "../../common/middleware/authorize.middleware";
import { categoryController } from "./category.controller";
import { createCategorySchema, updateCategorySchema } from "@invoice/shared";

const router = Router();


router.get("/", categoryController.getAllCategories);
router.get("/search", categoryController.searchCategories);
router.get("/filter", categoryController.filterCategories);
router.get("/:id", categoryController.getCategoryById);
router.post(
  "/",
  authorize("ADMIN"),
  validate(createCategorySchema),
  categoryController.createCategory,
);
router.put(
  "/:id",
  authorize("ADMIN"),
  validate(updateCategorySchema),
  categoryController.updateCategory,
);
router.delete("/:id", authorize("ADMIN"), categoryController.deleteCategory);

export { router as categoryRouter };
