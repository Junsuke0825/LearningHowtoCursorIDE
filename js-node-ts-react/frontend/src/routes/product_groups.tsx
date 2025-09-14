import React, { useEffect } from "react";
import Header from "../header";
import { NavLink, useNavigate } from "react-router-dom";
import {
  productGroupsUrl,
  ProductGroupType,
  ProductGroupsResponse,
  fetchJSONWithToken,
} from "../utils/util";
import useSWR from "swr";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { selectLoginStatus, selectToken } from "../utils/login-reducer";
import { useSelector } from "react-redux/es/exports";
import { RootState } from "../utils/store";

const pgColumnHelper = createColumnHelper<ProductGroupType>();

const columns = [
  pgColumnHelper.accessor("pgId", {
    header: "Id",
    cell: (info) => (
      <NavLink to={`/products/` + info.getValue()}>{info.getValue()}</NavLink>
    ),
  }),
  pgColumnHelper.accessor("name", {
    cell: (info) => info.getValue(),
    header: () => "Name",
  }),
];

function ProductGroupsTable({
  productGroups,
}: {
  productGroups: ProductGroupType[];
}) {
  // setData is not used, but it is required.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [data, setData] = React.useState(() => productGroups);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-4">
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ProductGroups() {
  const loginState = selectLoginStatus(
    useSelector((state: RootState) => state),
  );
  const token = selectToken(useSelector((state: RootState) => state));
  const navigate = useNavigate();

  const productGroupsSWR = useSWR<ProductGroupsResponse>(
    token ? [productGroupsUrl, "get", null, token] : null,
    ([url, method, data, token]: [string, string, any, string]) =>
      fetchJSONWithToken({ url, method, data, token }),
  );

  useEffect(() => {
    if (!(loginState === "loggedIn" && token)) {
      navigate("/login");
    }
  }, [loginState, navigate, token]);

  if (!(loginState === "loggedIn" && token)) {
    return null;
  }

  const productGroups = productGroupsSWR.data?.product_groups;
  const title = "Product Groups";

  return (
    <div>
      <Header />
      <div className="p-4">
        <div className="flex justify-between items-center p-4">
          <p className="text-left text-lg font-bold"> {title}</p>
          <NavLink
            to="/product-groups/create"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            新規作成
          </NavLink>
        </div>
        <div className="p-4">
          {productGroups && (
            <ProductGroupsTable productGroups={productGroups} />
          )}
        </div>
      </div>
    </div>
  );
}
