import { describe, it, expect } from "vitest";
import { FinancialCalculations } from "../../../common/calculations/financial-calculations";

describe("Financial Calculations - Business Logic", () => {
  describe("calculateItemTotal", () => {
    it("should calculate total without tax and discount", () => {
      const result = FinancialCalculations.calculateItemTotal({
        quantity: 2,
        unitPrice: 1000,
        taxRate: 0,
        discount: 0,
      });
      expect(result).toBe(2000);
    });

    it("should calculate total with tax only", () => {
      const result = FinancialCalculations.calculateItemTotal({
        quantity: 1,
        unitPrice: 1000,
        taxRate: 18,
        discount: 0,
      });
      expect(result).toBe(1180);
    });

    it("should calculate total with discount only", () => {
      const result = FinancialCalculations.calculateItemTotal({
        quantity: 1,
        unitPrice: 1000,
        taxRate: 0,
        discount: 10,
      });
      expect(result).toBe(900);
    });

    it("should calculate total with both tax and discount", () => {
      const result = FinancialCalculations.calculateItemTotal({
        quantity: 2,
        unitPrice: 1000,
        taxRate: 18,
        discount: 10,
      });
      expect(result).toBe(2124);
    });

    it("should handle quantity 0", () => {
      const result = FinancialCalculations.calculateItemTotal({
        quantity: 0,
        unitPrice: 1000,
        taxRate: 18,
        discount: 0,
      });
      expect(result).toBe(0);
    });
  });

  describe("calculateTotals", () => {
    const items = [
      { quantity: 2, unitPrice: 1000, taxRate: 0, discount: 0 },
      { quantity: 1, unitPrice: 500, taxRate: 0, discount: 0 },
    ];

    it("should calculate subtotal correctly", () => {
      const result = FinancialCalculations.calculateTotals(items, 0, 0);
      expect(result.subtotal).toBe(2500);
    });

    it("should calculate discount correctly", () => {
      const result = FinancialCalculations.calculateTotals(items, 10, 0);
      expect(result.discount).toBe(250);
    });

    it("should calculate tax correctly", () => {
      const result = FinancialCalculations.calculateTotals(items, 0, 18);
      expect(result.tax).toBe(450);
    });

    it("should calculate total with both discount and tax", () => {
      const result = FinancialCalculations.calculateTotals(items, 10, 18);
      expect(result.subtotal).toBe(2500);
      expect(result.discount).toBe(250);
      expect(result.tax).toBe(405);
      expect(result.total).toBe(2655);
    });

    it("should handle empty items array", () => {
      const result = FinancialCalculations.calculateTotals([], 10, 18);
      expect(result.subtotal).toBe(0);
      expect(result.discount).toBe(0);
      expect(result.tax).toBe(0);
      expect(result.total).toBe(0);
    });

    it("should handle item-level discounts", () => {
      const itemsWithDiscount = [
        { quantity: 1, unitPrice: 1000, taxRate: 0, discount: 20 },
      ];
      const result = FinancialCalculations.calculateTotals(itemsWithDiscount, 0, 0);
      expect(result.subtotal).toBe(1000);
      expect(result.discount).toBe(200);
      expect(result.total).toBe(800);
    });
  });

  describe("roundToDecimals", () => {
    it("should round to 2 decimal places", () => {
      expect(FinancialCalculations.roundToDecimals(100.456)).toBe(100.46);
      expect(FinancialCalculations.roundToDecimals(100.454)).toBe(100.45);
    });
  });

  describe("calculateProfitMargin", () => {
    it("should calculate profit margin correctly", () => {
      const margin = FinancialCalculations.calculateProfitMargin(500, 1000);
      expect(margin).toBe(50);
    });

    it("should return 0 when selling price is 0", () => {
      const margin = FinancialCalculations.calculateProfitMargin(500, 0);
      expect(margin).toBe(0);
    });
  });

  describe("calculateGlobalDiscount", () => {
    it("should calculate 10% discount on 1000", () => {
      const result = FinancialCalculations.calculateGlobalDiscount(1000, 10);
      expect(result).toBe(100);
    });

    it("should return 0 for 0% discount", () => {
      const result = FinancialCalculations.calculateGlobalDiscount(1000, 0);
      expect(result).toBe(0);
    });

    it("should return 0 for 0 subtotal", () => {
      const result = FinancialCalculations.calculateGlobalDiscount(0, 10);
      expect(result).toBe(0);
    });
  });

  describe("calculateTax", () => {
    it("should calculate 18% tax on 1000", () => {
      const result = FinancialCalculations.calculateTax(1000, 18);
      expect(result).toBe(180);
    });

    it("should return 0 for 0% tax", () => {
      const result = FinancialCalculations.calculateTax(1000, 0);
      expect(result).toBe(0);
    });

    it("should return 0 for 0 amount", () => {
      const result = FinancialCalculations.calculateTax(0, 18);
      expect(result).toBe(0);
    });
  });
});