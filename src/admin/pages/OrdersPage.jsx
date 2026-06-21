import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiSearchLine,
  RiShoppingCartLine,
} from "react-icons/ri";
import { supabase } from "../../lib/supabase";
import { formatEGP } from "../../lib/currency";

const STATUS_COLORS = {
  pending:    "bg-yellow-50 text-yellow-700",
  processing: "bg-blue-50 text-blue-700",
  shipped:    "bg-purple-50 text-purple-700",
  delivered:  "bg-green-50 text-green-700",
  cancelled:  "bg-red-50 text-red-700",
};

const ALL_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

/** Safely parse shipping_address — stored as JSONB or JSON string */
function parseAddress(raw) {
  if (!raw) return {};
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return {};
  }
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
        STATUS_COLORS[status] || "bg-gray-100 text-secondary"
      }`}
    >
      {status || "unknown"}
    </span>
  );
}

export default function OrdersPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        total,
        status,
        created_at,
        shipping_address,
        profiles ( full_name ),
        order_items ( count )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[OrdersPage] fetch error:", error);
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  };

  // Client-side filter (order list is usually small enough)
  const filtered = orders.filter((order) => {
    const addr = parseAddress(order.shipping_address);
    const customerName = (order.profiles?.full_name || addr.name || "").toLowerCase();
    const customerEmail = (addr.email || "").toLowerCase();
    const orderId = order.id.toLowerCase();
    const q = search.toLowerCase();

    const matchesSearch =
      !q || customerName.includes(q) || customerEmail.includes(q) || orderId.includes(q);

    const matchesStatus = !statusFilter || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-secondary mt-0.5">
            {orders.length} order{orders.length !== 1 ? "s" : ""} total
          </p>
        </div>
      </div>

      {/* Search + Status filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-base pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, email or order ID…"
            className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2.5 text-sm bg-white text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition sm:w-48"
        >
          <option value="">All statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {loading ? (
          <div className="divide-y divide-gray-100">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-3 sm:px-6 py-4 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-24" />
                <div className="flex-1 h-4 bg-gray-100 rounded w-40" />
                <div className="h-4 bg-gray-100 rounded w-28 hidden sm:block" />
                <div className="h-6 bg-gray-100 rounded-full w-20 hidden md:block" />
                <div className="h-4 bg-gray-100 rounded w-16" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <RiShoppingCartLine className="text-3xl text-emerald-400" />
            </div>
            <p className="font-semibold text-gray-900">
              {search || statusFilter ? "No orders match your search" : "No orders yet"}
            </p>
            <p className="text-sm text-secondary mt-1">
              {search || statusFilter
                ? "Try a different search or status filter."
                : "Orders will appear here once customers start buying."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="px-3 sm:px-6 py-3 text-xs font-medium text-secondary uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-xs font-medium text-secondary uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-xs font-medium text-secondary uppercase tracking-wider hidden md:table-cell">
                    Email
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-xs font-medium text-secondary uppercase tracking-wider hidden sm:table-cell">
                    Items
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-xs font-medium text-secondary uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-xs font-medium text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-xs font-medium text-secondary uppercase tracking-wider hidden lg:table-cell">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const addr = parseAddress(order.shipping_address);
                  const customerName =
                    order.profiles?.full_name || addr.name || "Guest";
                  const itemCount = order.order_items?.[0]?.count ?? 0;

                  return (
                    <tr
                      key={order.id}
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                      className="border-b border-gray-100 hover:bg-secondaryHover transition duration-150 last:border-none cursor-pointer"
                    >
                      {/* Order ID */}
                      <td className="px-3 sm:px-6 py-4 font-mono text-xs text-secondary">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>

                      {/* Customer name */}
                      <td className="px-3 sm:px-6 py-4 font-medium text-gray-900">
                        {customerName}
                      </td>

                      {/* Email */}
                      <td className="px-3 sm:px-6 py-4 text-secondary hidden md:table-cell">
                        {addr.email || "—"}
                      </td>

                      {/* Item count */}
                      <td className="px-3 sm:px-6 py-4 text-secondary hidden sm:table-cell">
                        {itemCount} item{itemCount !== 1 ? "s" : ""}
                      </td>

                      {/* Total */}
                      <td className="px-3 sm:px-6 py-4 font-bold text-primary">
                        {formatEGP(order.total)}
                      </td>

                      {/* Status */}
                      <td className="px-3 sm:px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>

                      {/* Date */}
                      <td className="px-3 sm:px-6 py-4 text-secondary hidden lg:table-cell">
                        {new Date(order.created_at).toLocaleDateString("en-GB")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
