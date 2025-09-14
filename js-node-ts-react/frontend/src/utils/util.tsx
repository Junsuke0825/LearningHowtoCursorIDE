import axios from "axios";
import React from "react";

export const hostName = "localhost";
export const port = "6600";
export const loginUrl = `http://${hostName}:${port}/login`;
export const productGroupsUrl = `http://${hostName}:${port}/product-groups`;
export const productsUrl = `http://${hostName}:${port}/products`;
export const productUrl = `http://${hostName}:${port}/product`;

export async function fetchJSON(params: {
  url: string;
  method?: string;
  data?: any;
}) {
  const { url, method, data } = params;
  
  const response = await axios({
    method: method || "get",
    url,
    data,
  });
  
  if ((response.status === 200 || response.status === 201) && response.data.ret === "ok") {
    return response.data;
  }
  throw new Error(response.data.msg || 'Request failed');
}

export async function fetchJSONWithToken(params: {
  url: string;
  method?: string;
  data?: any;
  token?: string;
}) {
  const { url, method, data, token } = params;
  
  if (!token) {
    throw new Error("Token missing");
  }
  
  // トークンが文字列でない場合は文字列に変換
  let tokenString: string;
  if (typeof token === 'string') {
    tokenString = token;
  } else if (typeof token === 'object' && token !== null) {
    // オブジェクトの場合は、JSON.stringifyしてから文字列化
    tokenString = JSON.stringify(token);
  } else {
    tokenString = String(token);
  }
  
  const headers = { "x-token": tokenString };
  
  const response = await axios({
    method: method || "get",
    url,
    data,
    headers,
  });
  if ((response.status === 200 || response.status === 201) && response.data.ret === "ok") {
    //console.log(`response.data: ${JSON.stringify(response.data)}`);
    return response.data;
  }
  throw new Error(response.data.msg);
}

export interface LoginResponse {
  ret: string;
  token: string;
}

export type ProductGroupType = {
  pgId: number;
  name: string;
};

export interface ProductGroupsResponse {
  product_groups: ProductGroupType[];
}

export type BookType = {
  pgId: number;
  pId: number;
  author: string;
  country: string;
  language: string;
  price: number;
  title: string;
  year: number;
};

export type MovieType = {
  pgId: number;
  pId: number;
  Director: string;
  country: string;
  Genre: string;
  price: number;
  title: string;
  year: number;
};

export type ProductType = BookType | MovieType;

export interface ProductsResponse {
  products: ProductType[];
}

export interface ProductResponse {
  product: ProductType;
}

export const ErrorMessage = ({
  title,
  msg,
}: {
  title: string;
  msg: string;
}) => {
  return (
    <>
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold mr-2">{title}</strong>
        <span className="block sm:inline">{msg}</span>
      </div>
    </>
  );
};
