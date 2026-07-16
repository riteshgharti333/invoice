import { Pagination } from "./pagination";

export class Search {
  static async search<T extends { id: string }>(
    findMany: (args: any) => Promise<T[]>,
    params: {
      searchTerm: string;
      exactFields?: string[];
      containsFields?: string[];
      nestedFields?: Record<string, string[] | Record<string, string[]>>; 
      cursor?: string;
      limit?: string;
      filters?: Record<string, any>;
    },
  ) {
    const conditions: any[] = [];

    // Exact match fields (case-insensitive)
    if (params.exactFields) {
      params.exactFields.forEach((field) => {
        conditions.push({
          [field]: {
            equals: params.searchTerm,
            mode: "insensitive",
          },
        });
      });
    }

    // Partial match fields
    if (params.containsFields) {
      params.containsFields.forEach((field) => {
        conditions.push({
          [field]: { contains: params.searchTerm, mode: "insensitive" },
        });
      });
    }

    // Nested relation fields - supports 2 and 3 levels
    if (params.nestedFields) {
      Object.entries(params.nestedFields).forEach(([relation, fields]) => {
        if (Array.isArray(fields)) {
          // 2-level nesting: { customer: ['name'] }
          fields.forEach((field) => {
            conditions.push({
              [relation]: {
                [field]: { contains: params.searchTerm, mode: "insensitive" },
              },
            });
          });
        } else if (typeof fields === 'object') {
          // 3-level nesting: { invoice: { customer: ['name'] } }
          Object.entries(fields).forEach(([subRelation, subFields]) => {
            (subFields as string[]).forEach((field) => {
              conditions.push({
                [relation]: {
                  [subRelation]: {
                    [field]: { contains: params.searchTerm, mode: "insensitive" },
                  },
                },
              });
            });
          });
        }
      });
    }

    const where: any = {
      OR: conditions,
    };

    if (params.filters) {
      Object.assign(where, params.filters);
    }

    // Min 2 chars
    if (params.searchTerm && params.searchTerm.length < 2) {
      return {
        data: [],
        nextCursor: null,
        hasMore: false,
        message: "Please enter at least 2 characters to search",
      };
    }

    return Pagination.paginate<T>((args) => findMany({ ...args, where }), {
      cursor: params.cursor,
      limit: params.limit ? parseInt(params.limit) : undefined,
    });
  }
}