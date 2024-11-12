import { PrismaClient, Prisma } from "@prisma/client";
import { ApiError } from "next/dist/server/api-utils";
import { NextRequest, NextResponse } from "next/server";
import axios from 'axios';
import { ColumnFiltersState, ColumnSort, PaginationState } from "@tanstack/react-table";


export const getApiClient = (pathURL: string) => axios.create({
  baseURL: process.env.NEXT_PUBLIC_URL + "/api" + pathURL,
});

export const API_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  OPTIONS: 'OPTIONS',
} as const;

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

// export function processQ

export function parseQueryParams(query: URLSearchParams, allowedSort?: string[]) {
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
      const k = key.replace('order_', '')

      if(allowedSort) {
        if(allowedSort.includes(k)) order[k] = value.toLowerCase() === 'desc' ? 'desc' : 'asc';
      } else order[k] = value.toLowerCase() === 'desc' ? 'desc' : 'asc';
    }
  });


  return { filters, order, pagination };
}

export function parseListHookParams(pagination?: PaginationState, filter?: ColumnFiltersState, sort?: ColumnSort) {
  let query = ''
  const params: {[key: string]: any} = {}

  params.page = pagination ? pagination.pageIndex+1 : 1
  params.pageSize = pagination ? pagination.pageSize : 10
  
  query += `?page=${params.page}&pageSize=${params.pageSize}`
  
  if(sort) {
    params['order_' + sort.id] = sort.desc ? 'desc' : 'asc'
    query += `&order_${sort.id}=${sort.desc ? 'desc' : 'asc'}`
  }

  if(filter) {
    filter.forEach((f, i) => {
      params['filter_'+f.id] = f.value
      query += `${f.id}=${f.value}`
      if(i < filter.length-1) query += '&' 
    })
  }

  return {params, urlParams: query}
}

export function parseListHookParamsNew(pagination?: PaginationState, filter?: ColumnFiltersState, sort?: ColumnSort) {
  let query = ''
  const params: {[key: string]: any} = {}

  params.page = pagination ? pagination.pageIndex+1 : 1
  params.pageSize = pagination ? pagination.pageSize : 10
  
  query += `?page=${params.page}&pageSize=${params.pageSize}`
  
  if(sort) {
    params['orderBy'] = sort.id
    params['orderDir'] = sort.desc ? 'desc' : 'asc'
    query += `&orderBy=${sort.id}&orderDir${sort.id}=${sort.desc ? 'desc' : 'asc'}`
  }

  if(filter) {
    filter.forEach((f, i) => {
      params[f.id] = f.value
      query += `${f.id}=${f.value}`
      if(i < filter.length-1) query += '&' 
    })
  }

  return {params, urlParams: query}
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
  handler: (req: NextRequest, {params}: {params: any}) => Promise<NextResponse>
) {
  return async (req: NextRequest, {params}: {params: any}): Promise<NextResponse> => {
    try {
      return await handler(req, params);
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


// Filtering And Sorting

export type SingleColumnDef = {
  type: 'string' | 'number' | 'datetime' | 'enum' | 'boolean',
  label?: string, 
  path?: string,
  method?: 'equals' | 'contains',
  customFn?: (val: string | number | Date[] | boolean) => any,
  disableSorting?: boolean,
  enum?: {[key: string]: string}
}

export type ModelColumns = {
  [key: string]: SingleColumnDef
}


const parseValue = (value: string, type: SingleColumnDef['type']) => {
  switch (type) {
    case 'number':
      let number = parseFloat(value)
      if(isNaN(number)) return Error(`Nesprávny formát čísla - '${value}'`)
      return number;
    case 'boolean':
      return value === 'true';
    case 'datetime':
      let splitted = value.split('~').map((d) => new Date(d))
      if(splitted.some(d => isNaN(d.getTime())) || splitted.length > 2) return Error(`Nesprávny formát dátumu - '${value}'`)
      
      if(splitted.length == 2){
        if(splitted[1] < splitted[0]) return Error(`Začiatočný dátum musí byť skôr ako neskorší dátum - '${value}'`)
        if(splitted[0].getTime() == splitted[1].getTime()) {
          splitted.splice(0, 1)
        }
      }
      return splitted // Convert to Date object
    case 'enum':
      return value
    default:
      return value.trim();
  }
};

export const getFilters = (params: any, columns: ModelColumns) => {
  const filter: any = {};
  
  for (const colName of Object.keys(columns)) {
    let rawVal = params[colName]
    if(!rawVal) continue

    const colDef = columns[colName]
    const colPath = (colDef.path && colDef.path.split('.')) || [colName]
    const filterMethod = colDef.method || 'equals'

    let val = parseValue(rawVal, colDef.type)
    if(val instanceof Error) throw new ApiError(400, val.message)

    let filterCondition: any = {};

    if(colDef.customFn) {
      const customFilter = colDef.customFn(val)
      Object.assign(filter, customFilter)
      continue
    }
      
    let currentLevel = filterCondition;

    colPath.forEach((part, index) => {
      if (index === colPath.length - 1) {
        // Apply different filter logic based on type
        if(colDef.type == 'string' || colDef.type == 'enum') {
          currentLevel[part] = {
            [filterMethod]: val,
          };
        }
        if(colDef.type == 'datetime'){
          const dates = val as Date[]
          let dFilter;

          if(dates.length == 2) {
            dFilter = {gte: dates[0], lte: dates[1]}
          } else {
            const start = new Date(dates[0])
            start.setHours(0, 0, 0, 0);
            const end = new Date(dates[0])
            end.setHours(23, 59, 59, 999);
            dFilter = {gte: start, lte: end}
          }

          currentLevel[part] = dFilter;
        }

        if(colDef.type == 'number') {
          currentLevel[part] = {
            [filterMethod]: val,
          };
        }
      } else {
        currentLevel[part] = {};
        currentLevel = currentLevel[part];
      }
    });
    filter[colPath[0]] = filterCondition[colPath[0]]
  }

  return filter
}

export const getSorting = (params: any, columns: ModelColumns) => {
  const sorting: any = {}

  let {orderBy, orderDir} = params

  if(!orderBy) return sorting
  if(!orderDir) orderDir = 'asc'

  if(!['asc', 'desc'].includes(orderDir)) throw new ApiError(400, `orderDir má neplatnú hodnotu ${orderDir}`)

  const colName = Object.keys(columns).find(name => name === orderBy)
  if(!colName) throw new ApiError(400, `orderBy má neplatnú hodnotu - '${orderBy}'`)
  
  const colDef = columns[colName]
  if(colDef.disableSorting) throw new ApiError(400, `orderBy má neplatnú hodnotu - '${orderBy}'`)
  const colPath = (colDef.path && colDef.path.split('.')) || [colName]

  // let filterCondition: any = {};
  let currentLevel = sorting;

  colPath.forEach((part, index) => {
    if (index === colPath.length - 1) {
      // Apply different filter logic based on type
      currentLevel[part] = orderDir

    } else {
      currentLevel[part] = {};
      currentLevel = currentLevel[part];
    }
  });

  return sorting
}

export const parseGetManyParams = (urlParams: URLSearchParams, columns: ModelColumns) => {
  const params = Object.fromEntries(new URLSearchParams(urlParams));

  // Add default id column
  columns.id = {
    type: 'number'
  }

  const pagination: {page?: number, pageSize?: number} = {
    page: parseInt(params.page || '1'),
    pageSize: parseInt(params.pageSize || '10')
  };

  const where = getFilters(params, columns)
  const orderBy = getSorting(params, columns)
  

  return {where, orderBy, pagination}
}  