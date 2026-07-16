import { PAGINATED_RESPONSE_SYMBOL } from "../utils/apiResponse";

export class Pagination {
  private static readonly MAX_PER_PAGE = 10;
  private static readonly DEFAULT_ORDER = "desc";

  static async paginate<T extends { id: string }>(
    findMany: (args: any) => Promise<T[]>,
    params: { cursor?: string; limit?: number; order?: "asc" | "desc" },
  ) {
    const take = Math.min(
      params.limit || Pagination.MAX_PER_PAGE,
      Pagination.MAX_PER_PAGE,
    );
    const order = params.order || Pagination.DEFAULT_ORDER;

    let queryArgs: any = {
      take: take + 1,
      orderBy: { id: order },
    };

    if (params.cursor) {
      const base64 = params.cursor.replace(/-/g, "+").replace(/_/g, "/");
      const decodedCursor = JSON.parse(
        Buffer.from(base64, "base64").toString(),
      );

      queryArgs.where = {
        id: { [order === "desc" ? "lt" : "gt"]: decodedCursor.id },
      };
    }

    const items = await findMany(queryArgs);

    const hasMore = items.length > take;
    const data = hasMore ? items.slice(0, -1) : items;

    const nextCursor = hasMore
      ? Buffer.from(JSON.stringify({ id: data[data.length - 1].id }))
          .toString("base64")
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=/g, "")
      : null;

    // Return with Symbol marker - apiResponse will recognize this!
    return {
      data,
      nextCursor,
      hasMore,
      [PAGINATED_RESPONSE_SYMBOL]: true, // Secret marker
    };
  }
}
