import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { formatEGP } from "../../lib/currency";
import StatCard from "../components/StatCard";
import {
  RiShoppingCartLine,
  RiMoneyDollarCircleLine,
  RiShoppingBagLine,
  RiUserLine,
} from "react-icons/ri";

function parseAddress(raw) {
  if (!raw) return {};
  try { return typeof raw === "string" ? JSON.parse(raw) : raw; }
  catch { return {}; }
}

function whatsappLink(phone) {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "20" + digits.slice(1);
  return `https://wa.me/${digits}`;
}

const statusColors = {
  pending:    "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
  processing: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  shipped:    "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  delivered:  "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  cancelled:  "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
        statusColors[status] || "bg-gray-100 text-secondary dark:bg-gray-700 dark:text-gray-300"
      }`}
    >
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, products: 0, customers: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [
        { count: ordersCount },
        { count: productsCount },
        { count: customersCount },
        { data: revenueData },
        { data: ordersData },
      ] = await Promise.all([
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer"),
        supabase.from("orders").select("total"),
        supabase
          .from("orders")
          .select("id, total, status, created_at, shipping_address, profiles(full_name)")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const totalRevenue = revenueData?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;

      setStats({
        revenue: totalRevenue,
        orders: ordersCount || 0,
        products: productsCount || 0,
        customers: customersCount || 0,
      });
      setRecentOrders(ordersData || []);
      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatEGP(stats.revenue)}
          icon={<RiMoneyDollarCircleLine className="text-xl text-emerald-600" />}
          iconBg="bg-emerald-50 dark:bg-emerald-500/10"
        />
        <StatCard
          title="Total Orders"
          value={stats.orders}
          icon={<RiShoppingCartLine className="text-xl text-primary" />}
          iconBg="bg-blue-50 dark:bg-primary/10"
        />
        <StatCard
          title="Total Products"
          value={stats.products}
          icon={<RiShoppingBagLine className="text-xl text-purple-600" />}
          iconBg="bg-purple-50 dark:bg-purple-500/10"
        />
        <StatCard
          title="Total Customers"
          value={stats.customers}
          icon={<RiUserLine className="text-xl text-orange-600" />}
          iconBg="bg-orange-50 dark:bg-orange-500/10"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">

        {/* Card header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Recent Orders
          </h2>
          <Link
            to="/admin/orders"
            className="text-sm text-primary hover:text-primaryHover transition duration-200"
          >
            View all
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-semibold text-gray-800 dark:text-gray-100">No orders yet</p>
            <p className="text-sm text-secondary dark:text-gray-400 mt-1">
              Orders will appear here once customers start buying.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                  {/* px-3 sm:px-6 — tighter padding on mobile so columns fit the viewport */}
                  <th className="px-3 sm:px-6 py-3 text-xs font-medium text-secondary dark:text-gray-400 uppercase tracking-wider">Order</th>
                  <th className="px-3 sm:px-6 py-3 text-xs font-medium text-secondary dark:text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-3 sm:px-6 py-3 text-xs font-medium text-secondary dark:text-gray-400 uppercase tracking-wider">Status</th>
                  {/* Total and Date hidden on mobile — revealed at sm+ */}
                  <th className="px-3 sm:px-6 py-3 text-xs font-medium text-secondary dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">Total</th>
                  <th className="px-3 sm:px-6 py-3 text-xs font-medium text-secondary dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-secondaryHover dark:hover:bg-gray-800 transition duration-200 last:border-none"
                  >
                    <td className="px-3 sm:px-6 py-4 font-mono text-xs text-secondary dark:text-gray-400">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[120px] sm:max-w-none">
                        {order.profiles?.full_name || parseAddress(order.shipping_address).name || "Guest"}
                      </p>
                      {(() => {
                        const phone = parseAddress(order.shipping_address).phone;
                        const link = whatsappLink(phone);
                        return link ? (
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-green-600 hover:text-green-700 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {phone}
                          </a>
                        ) : null;
                      })()}
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-3 sm:px-6 py-4 font-bold text-primary hidden sm:table-cell">
                      {formatEGP(order.total)}
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-secondary dark:text-gray-400 hidden md:table-cell">
                      {new Date(order.created_at).toLocaleDateString("en-GB")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
