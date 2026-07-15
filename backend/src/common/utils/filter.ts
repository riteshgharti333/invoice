// src/common/utils/filter.ts
import { Pagination } from './pagination';

export class Filter {
  static async filter<T extends { id: string }>(
    findMany: (args: any) => Promise<T[]>,
    params: {
      filters: Record<string, any>;
      nestedFilters?: Record<string, Record<string, any>>;
      cursor?: string;
      limit?: string;
    }
  ) {
    const where: any = {
      AND: [],
    };

    // Normal filters
    Object.entries(params.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        // Handle date range
        if (key.endsWith('From') || key.endsWith('To')) {
          const isDateField = key.includes('Date');
          const suffix = isDateField ? 'Date' : '';
          const fieldName = key.replace(/From|To/, '');
          const existingFilter = where.AND.find((f: any) => f[fieldName]);
          const rangeFilter = existingFilter ? existingFilter[fieldName] : {};
          
          if (key.endsWith('From')) {
            rangeFilter.gte = isDateField ? new Date(value) : parseFloat(value);
          } else {
            rangeFilter.lte = isDateField ? new Date(value) : parseFloat(value);
          }
          
          if (!existingFilter) {
            where.AND.push({ [fieldName]: rangeFilter });
          }
        }
        // Handle boolean
        else if (value === 'true' || value === 'false') {
          where.AND.push({ [key]: value === 'true' });
        }
        // Handle normal fields
        else {
          where.AND.push({ [key]: value });
        }
      }
    });

    // Nested relation filters
    if (params.nestedFilters) {
      Object.entries(params.nestedFilters).forEach(([relation, fields]) => {
        const relationFilter: any = {};
        
        Object.entries(fields).forEach(([field, value]) => {
          if (value !== undefined && value !== '' && value !== null) {
            if (field.endsWith('Contains')) {
              const actualField = field.replace('Contains', '');
              relationFilter[actualField] = { contains: value, mode: 'insensitive' };
            } else {
              relationFilter[field] = value;
            }
          }
        });
        
        if (Object.keys(relationFilter).length > 0) {
          where.AND.push({ [relation]: relationFilter });
        }
      });
    }

    const finalWhere = where.AND.length > 0 ? where : {};

    return Pagination.paginate<T>(
      (args) => findMany({ ...args, where: finalWhere }),
      {
        cursor: params.cursor,
        limit: params.limit ? parseInt(params.limit) : undefined
      }
    );
  }
}