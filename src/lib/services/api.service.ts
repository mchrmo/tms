import { PrismaClient, Prisma } from "@prisma/client";
import { ApiError } from "next/dist/server/api-utils";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// Define a union type of all model names available in Prisma
export type ModelNames =
  (typeof Prisma.ModelName)[keyof typeof Prisma.ModelName];

// Define a type for Prisma operations specific to a given model
type PrismaOperations<ModelName extends ModelNames> =
  Prisma.TypeMap['model'][ModelName]['operations'];

// Define a type for Prisma findMany arguments specific to a given model
type PrismaFindManyArgs<ModelName extends ModelNames> =
  PrismaOperations<ModelName>['findMany']['args'];

// Define a type for pagination options, including model name, query filters, and pagination parameters
type PaginationOptions<ModelName extends ModelNames> = {
  modelName: ModelName; // Name of the model to paginate
  where?: PrismaFindManyArgs<ModelName>['where']; // Filtering conditions for the query
  orderBy?: PrismaFindManyArgs<ModelName>['orderBy']; // Sorting criteria for the query
  include?: PrismaFindManyArgs<ModelName> extends { include: infer I } ? I : never;
  page?: string; // Page number for pagination
  pageSize?: string; // Number of items per page for pagination
};

export type PaginatedResponse<T> = {
  items: T[],
  totalCount: number,
  currentPage: number,
  prevPage: number | null,
  nextPage: number | null
}


export async function paginate<ModelName extends ModelNames>({
  page,
  pageSize,
  modelName,
  where,
  orderBy,
  include,
}: PaginationOptions<ModelName>) {
  try {
    const db = prisma[modelName as keyof PrismaClient] as any;
    // Use 'as any' to bypass TypeScript's type checking for now

    if (!db.findMany) {
      throw new ApiError(400, `Model ${modelName} does not support findMany operation`);
    }

    if ((!page)  || page == '0'  || !pageSize || pageSize == '0') {
      const items = await db.findMany({
        where: where || {},
        orderBy: orderBy || {
          // createdAt: 'asc',
        },
        include: include || {},
      });
      return {
        items,
        totalCount: items.length,
      };
    }

    const skip = (+page - 1) * +pageSize;
    // Calculate the number of items to skip based on the current page and page size

    const totalCount = await db.count({
      where,
    });
    // Get the total count of items satisfying the provided conditions

    const items = await db.findMany({
      where,
      orderBy,
      skip,
      take: +pageSize, // Ensure pageSize is a number
      include: include || {},
    });
    // Fetch paginated items based on the provided conditions, ordering, skip, and take

    return {
      items,
      totalCount,
      currentPage: +page,
      prevPage: +page > 1 ? +page - 1 : null,
      nextPage: skip + +pageSize < totalCount ? +page + 1 : null,
    };
  } catch (error: any) {
    throw new ApiError(404, error.message ? error.message : 'Unknown db error.');
    // Throw a NotFoundException if data is not found or an error occurs
  }
}

export function getParams(req: NextRequest) {
  return Object.fromEntries(req.nextUrl.searchParams.entries());
}

export function parseQueryParams(query: URLSearchParams) {
  const filters: Record<string, any> = {};
  const order: { [key: string]: "asc" | "desc"} = {};
  const pagination: {page?: string, pageSize?: string} = {
    page: query.get('page') || '1',
    pageSize: query.get('pageSize') || '10'
  };

  query.forEach((value, key) => {
    if (key.startsWith('filter_')) {
      filters[key.replace('filter_', '')] = value;
    } else if (key.startsWith('order_')) {
      order[key.replace('order_', '')] = value.toLowerCase() === 'desc' ? 'desc' : 'asc';
    }
  });


  return { filters, order, pagination };
}


export type FieldType = 'string' | 'number' | 'date' | 'enum';

export type FieldDef = {[key: string]: FieldType}
interface Filter {
  [key: string]: any;
}

interface Where {
  [key: string]: any;
}


export function parseFilter(filter: Filter, fields: FieldDef): Where {
  const where: Where = {};

  for (const key in filter) {
    if (filter.hasOwnProperty(key)) {
      const fieldType = fields[key];
      const value = filter[key];

      if (fieldType) {
        switch (fieldType) {
          case 'string':
            where[key] = { contains: value };
            break;
          case 'number':
            where[key] = { equals: parseInt(value) };
            break;
          case 'enum':
            where[key] = { equals: value};
            break;  
          case 'date':
            if (typeof value === 'string') {
              where[key] = { equals: new Date(value) };
            } else if (typeof value === 'object' && value.start && value.end) {
              where[key] = {
                gte: new Date(value.start),
                lte: new Date(value.end)
              };
            }
            break;
        }
      }
    }
  }

  return where;
}


export function errorHandler(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(req);
    } catch (error) {
      console.error('Error occurred:', error);

      if (error instanceof ApiError) {
        return NextResponse.json({ message: error.message, statusCode: error.statusCode }, { status: error.statusCode });
      } else {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      }
    }
  };
}