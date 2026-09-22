export interface PaginationResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const paginate = <T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginationResult<T> => {
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getPaginationParams = (
  query: { page?: number; limit?: number },
  defaultLimit = 20
) => {
  const page = Math.max(1, query.page || 1);
  const limit = Math.max(1, Math.min(100, query.limit || defaultLimit));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};
