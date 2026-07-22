import { z } from "zod";

// Customer Schemas
export const createCustomerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must not exceed 100 characters"),
    email: z
      .string()
      .email("Invalid email format")
      .optional()
      .or(z.literal("")),
    phone: z
      .string()
      .min(10, "Phone number must be at least 10 characters")
      .max(15, "Phone number must not exceed 15 characters"),
    address: z
      .string()
      .max(500, "Address must not exceed 500 characters")
      .optional(),
    gstNumber: z
      .string()
      .max(15, "GST number must be exactly 15 characters")
      .optional(),
    notes: z
      .string()
      .max(1000, "Notes must not exceed 1000 characters")
      .optional(),
  }),
});

export const updateCustomerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must not exceed 100 characters")
      .optional(),

    email: z
      .string()
      .email("Invalid email format")
      .optional()
      .or(z.literal("")),

    phone: z
      .string()
      .min(10, "Phone number must be at least 10 characters")
      .max(15, "Phone number must not exceed 15 characters")
      .optional(),

    address: z
      .string()
      .max(500, "Address must not exceed 500 characters")
      .optional(),

    gstNumber: z
      .string()
      .length(15, "GST number must be exactly 15 characters")
      .optional()
      .or(z.literal("")),

    notes: z
      .string()
      .max(1000, "Notes must not exceed 1000 characters")
      .optional(),
  }),
});

// Category Schemas
export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must not exceed 100 characters"),
    description: z
      .string()
      .max(500, "Description must not exceed 500 characters")
      .optional(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must not exceed 100 characters")
      .optional(),

    description: z
      .string()
      .max(500, "Description must not exceed 500 characters")
      .optional(),
  }),
});

// Service Schemas
export const createServiceSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(200, "Name must not exceed 200 characters"),

    description: z
      .string()
      .max(1000, "Description must not exceed 1000 characters")
      .optional(),

    categoryId: z.string().optional(),

    unit: z.string().max(50, "Unit must not exceed 50 characters").optional(),

    price: z.number().positive("Price must be positive"),

    taxRate: z
      .number()
      .min(0, "Tax rate cannot be negative")
      .max(100, "Tax rate cannot exceed 100")
      .optional(),
  }),
}); 

export const updateServiceSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(200, "Name must not exceed 200 characters")
      .optional(),

    description: z
      .string()
      .max(1000, "Description must not exceed 1000 characters")
      .optional(),

    categoryId: z.string().optional(),

    unit: z.string().max(50, "Unit must not exceed 50 characters").optional(),

    price: z.number().positive("Price must be positive").optional(),

    taxRate: z
      .number()
      .min(0, "Tax rate cannot be negative")
      .max(100, "Tax rate cannot exceed 100")
      .optional(),
  }),
});

// Quotation Schemas
export const createQuotationSchema = z.object({
  body: z.object({
    customerId: z.string().min(1, "Customer is required"),
    issueDate: z.string().optional(),
    expiryDate: z.string().optional(),
    discount: z.number().min(0).max(100).optional(),
    tax: z.number().min(0).max(100).optional(),
    notes: z
      .string()
      .max(1000, "Notes must not exceed 1000 characters")
      .optional(),
    termsConditions: z
      .string()
      .max(2000, "Terms & Conditions must not exceed 2000 characters")
      .optional(),
    items: z
      .array(
        z.object({
          serviceId: z.string().min(1, "Service is required"),
          description: z
            .string()
            .max(500, "Description must not exceed 500 characters")
            .optional(),
          quantity: z.number().min(1, "Quantity must be at least 1"),
          unitPrice: z.number().positive("Unit price must be positive"),
          taxRate: z.number().min(0).max(100).optional(),
          discount: z.number().min(0).max(100).optional(),
        }),
      )
      .min(1, "At least one item is required"),
  }),
});

export const updateQuotationSchema = z.object({
  body: z.object({
    customerId: z.string().min(1, "Customer is required").optional(),

    issueDate: z.string().optional(),

    expiryDate: z.string().optional(),

    discount: z.number().min(0).max(100).optional(),

    tax: z.number().min(0).max(100).optional(),

    notes: z
      .string()
      .max(1000, "Notes must not exceed 1000 characters")
      .optional(),

    termsConditions: z
      .string()
      .max(2000, "Terms & Conditions must not exceed 2000 characters")
      .optional(),

    status: z
      .enum(["DRAFT", "SENT", "APPROVED", "REJECTED", "EXPIRED"])
      .optional(),

    items: z
      .array(
        z.object({
          serviceId: z.string().min(1, "Service is required"),

          description: z
            .string()
            .max(500, "Description must not exceed 500 characters")
            .optional(),

          quantity: z.number().min(1, "Quantity must be at least 1"),

          unitPrice: z.number().positive("Unit price must be positive"),

          taxRate: z.number().min(0).max(100).optional(),

          discount: z.number().min(0).max(100).optional(),
        }),
      )
      .optional(),
  }),
});

export const updateQuotationStatusSchema = z.object({
  body: z.object({
    status: z.enum(["DRAFT", "SENT", "APPROVED", "REJECTED", "EXPIRED"]),
  }),
});

// Invoice Schemas

export const invoiceStatusSchema = z.enum([
  "DRAFT",
  "SENT",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
  "CANCELLED",
]);

export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>;

export const createInvoiceSchema = z.object({
  body: z.object({
    customerId: z.string().min(1, "Customer is required"),
    quotationId: z.string().optional(),
    issueDate: z.string().optional(),
    dueDate: z.string().optional(),
    discount: z.number().min(0).max(100).optional(),
    tax: z.number().min(0).max(100).optional(),
    notes: z
      .string()
      .max(1000, "Notes must not exceed 1000 characters")
      .optional(),
    termsConditions: z
      .string()
      .max(2000, "Terms & Conditions must not exceed 2000 characters")
      .optional(),
    items: z
      .array(
        z.object({
          serviceId: z.string().min(1, "Service is required"),
          description: z
            .string()
            .max(500, "Description must not exceed 500 characters")
            .optional(),
          quantity: z.number().min(1, "Quantity must be at least 1"),
          unitPrice: z.number().positive("Unit price must be positive"),
          taxRate: z.number().min(0).max(100).optional(),
          discount: z.number().min(0).max(100).optional(),
        }),
      )
      .min(1, "At least one item is required"),
  }),
});

export const updateInvoiceSchema = z.object({
  body: z.object({
    customerId: z.string().min(1, "Customer is required").optional(),

    quotationId: z.string().optional(),

    issueDate: z.string().optional(),

    dueDate: z.string().optional(),

    discount: z.number().min(0).max(100).optional(),

    tax: z.number().min(0).max(100).optional(),

    notes: z
      .string()
      .max(1000, "Notes must not exceed 1000 characters")
      .optional(),

    termsConditions: z
      .string()
      .max(2000, "Terms & Conditions must not exceed 2000 characters")
      .optional(),

    status: invoiceStatusSchema.optional(),

    items: z
      .array(
        z.object({
          serviceId: z.string().min(1, "Service is required"),

          description: z
            .string()
            .max(500, "Description must not exceed 500 characters")
            .optional(),

          quantity: z.number().min(1, "Quantity must be at least 1"),

          unitPrice: z.number().positive("Unit price must be positive"),

          taxRate: z.number().min(0).max(100).optional(),

          discount: z.number().min(0).max(100).optional(),
        }),
      )
      .optional(),
  }),
});

export const updateInvoiceStatusSchema = z.object({
  body: z.object({
    status: invoiceStatusSchema,
  }),
});

// Payment Schemas

export const paymentMethodSchema = z.enum([
  "CASH",
  "BANK_TRANSFER",
  "UPI",
  "CREDIT_CARD",
  "DEBIT_CARD",
  "PAYPAL",
  "OTHER",
]);

export const paymentStatusSchema = z.enum([
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
]);

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;


export const createPaymentSchema = z.object({
  body: z.object({
    invoiceId: z.string().min(1, "Invoice is required"),

    amount: z.number().positive("Amount must be positive"),

    paymentMethod: paymentMethodSchema,

    paymentDate: z.string().optional(),

    transactionNumber: z
      .string()
      .max(100, "Transaction number must not exceed 100 characters")
      .optional(),

    notes: z
      .string()
      .max(500, "Notes must not exceed 500 characters")
      .optional(),
  }),
});

export const updatePaymentSchema = z.object({
  body: z.object({
    amount: z.number().positive("Amount must be positive").optional(),

    paymentMethod: paymentMethodSchema.optional(),

    paymentDate: z.string().optional(),

    transactionNumber: z
      .string()
      .max(100, "Transaction number must not exceed 100 characters")
      .optional(),

    notes: z
      .string()
      .max(500, "Notes must not exceed 500 characters")
      .optional(),

    status: paymentStatusSchema.optional(),
  }),
});

export const updatePaymentStatusSchema = z.object({
  body: z.object({
    status: paymentStatusSchema,
  }),
});
