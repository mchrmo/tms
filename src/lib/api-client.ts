import axios from 'axios';


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