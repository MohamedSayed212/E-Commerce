import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RiArrowLeftLine, RiShoppingBagLine } from "react-icons/ri";
import { supabase } from "../../lib/supabase";
import Toast from "../components/Toast";
import { formatEGP } from "../../lib/currency";

function whatsappLink(phone) {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "20" + digits.slice(1);
  return `https://wa.me/${digits}`;
}

const STATUS_COLORS = {
  pending:    "bg-yellow-50 text-yellow-700 border-yellow-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped:    "bg-purple-50 text-purple-700 border-purple-200",
  delivered:  "bg-green-50 text-green-700 border-green-200",
  cancelled:  "bg-red-50 text-red-700 border-red-200",
};

const ALL_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

function parseAddress(raw) {
  if (!raw) return {};
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return {};
  }
}

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => setToast({ type, message });

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    setLoading(true);

    // Fetch the order with profile info
    const { data: orderData, error: orderErr } = await supabase
      .from("orders")
      .select(`
        id,
        total,
        status,
        created_at,
        shipping_address,
        profiles ( full_name )
      `)
      .eq("id", orderId)
      .single();

    if (orderErr) {
      console.error("[OrderDetail] order fetch error:", orderErr);
      setLoading(false);
      return;
    }

    setOrder(orderData);

    // Fetch order items with product details
    const { data: itemsData, error: itemsErr } = await supabase
      .from("order_items")
      .select(`
        id,
        quantity,
        price,
        product_name,
        product_image,
        products ( id, name, images )
      `)
      .eq("order_id", orderId);

    if (itemsErr) {
      console.error("[OrderDetail] items fetch error:", itemsErr);
      setLoading(false);
      return;
    }

    const fetched = itemsData || [];

    // For items with no product link and no snapshot, try price-matching
    // against the products catalog as a best-effort fallback.
    const needsMatch = fetched.filter(
      (i) => !i.products && !i.product_name && !i.product_image
    );

    if (needsMatch.length > 0) {
      const prices = [...new Set(needsMatch.map((i) => i.price))];
      const { data: byPrice } = await supabase
        .from("products")
        .select("id, name, images, price")
        .in("price", prices);

      const priceMap = {};
      (byPrice || []).forEach((p) => {
        if (!priceMap[p.price]) priceMap[p.price] = p;
      });

      setItems(
        fetched.map((item) => {
          if (!item.products && !item.product_name && priceMap[item.price]) {
            return {
              ...item,
              product_name: priceMap[item.price].name,
              product_image: priceMap[item.price].images?.[0] ?? null,
            };
          }
          return item;
        })
      );
    } else {
      setItems(fetched);
    }

    setLoading(false);
  };

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      console.error("[OrderDetail] status update error:", error);
      showToast("error", "Failed to update status.");
    } else {
      setOrder((prev) => ({ ...prev, status: newStatus }));
      showToast("success", `Status updated to "${newStatus}".`);
    }

    setUpdatingStatus(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Order not found.</p>
        <button
          onClick={() => navigate("/admin/orders")}
          className="mt-4 text-primary hover:underline text-sm"
        >
          ← Back to Orders
        </button>
      </div>
    );
  }

  const addr = parseAddress(order.shipping_address);
  const customerName = order.profiles?.full_name || addr.name || "Guest";

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/admin/orders")}
          className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-secondary hover:bg-secondaryHover transition"
        >
          <RiArrowLeftLine />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
                STATUS_COLORS[order.status] || "bg-gray-100 text-secondary border-gray-200"
              }`}
            >
              {order.status}
            </span>
          </div>
          <p className="text-sm text-secondary mt-0.5">
            Placed on {new Date(order.created_at).toLocaleDateString("en-GB", {
              day: "numeric", month: "long", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column: items + totals ─────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Order Items */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">
                Order Items ({items.length})
              </h2>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <RiShoppingBagLine className="text-3xl text-gray-300 mb-2" />
                <p className="text-sm text-secondary">No items found.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {items.map((item) => {
                  const product = item.products;
                  const name = product?.name || item.product_name || "Product";
                  const image = product?.images?.[0] || item.product_image;

                  return (
                    <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                      {/* Product image */}
                      {image ? (
                        <img
                          src={image}
                          alt={name}
                          className="w-14 h-14 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <RiShoppingBagLine className="text-gray-400" />
                        </div>
                      )}

                      {/* Product name */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {name}
                        </p>
                        <p className="text-xs text-secondary mt-0.5">
                          {formatEGP(item.price)} × {item.quantity}
                        </p>
                      </div>

                      {/* Line total */}
                      <p className="font-bold text-primary flex-shrink-0">
                        {formatEGP(item.price * item.quantity)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Order total */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
              <span className="font-semibold text-gray-900">Order Total</span>
              <span className="text-xl font-bold text-primary">
                {formatEGP(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Right column: customer + status ───────────────────────── */}
        <div className="space-y-4">

          {/* Customer & Shipping */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Customer</h2>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-xs text-secondary uppercase tracking-wide mb-0.5">Name</p>
                <p className="text-gray-900 font-medium">{customerName}</p>
              </div>
              {addr.email && (
                <div>
                  <p className="text-xs text-secondary uppercase tracking-wide mb-0.5">Email</p>
                  <p className="text-gray-900">{addr.email}</p>
                </div>
              )}
              {addr.phone && (
                <div>
                  <p className="text-xs text-secondary uppercase tracking-wide mb-0.5">Phone</p>
                  <a
                    href={whatsappLink(addr.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 hover:underline font-medium"
                  >
                    {addr.phone}
                  </a>
                </div>
              )}
            </div>

            <div className="mt-5 pt-5 border-t border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">Shipping Address</h3>
              <div className="space-y-1 text-sm text-gray-700">
                {addr.address && <p>{addr.address}</p>}
                {addr.city && <p>{addr.city}</p>}
                {addr.delivery && (
                  <p className="text-secondary mt-1">
                    Delivery: {addr.delivery}
                  </p>
                )}
                {addr.payment && (
                  <p className="text-secondary">
                    Payment: {addr.payment === "cod" ? "Cash on Delivery" : "Credit Card"}
                  </p>
                )}
                {addr.notes && (
                  <p className="mt-2 text-secondary italic">"{addr.notes}"</p>
                )}
              </div>
            </div>
          </div>

          {/* Status management */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Order Status</h2>

            <div className="space-y-2">
              {ALL_STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    if (status !== order.status) handleStatusChange(status);
                  }}
                  disabled={updatingStatus}
                  className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm font-medium capitalize transition ${
                    order.status === status
                      ? STATUS_COLORS[status] || "bg-gray-100 text-secondary border-gray-200"
                      : "border-gray-200 text-secondary hover:bg-secondaryHover"
                  } disabled:opacity-50`}
                >
                  <span
                    className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      order.status === status ? "bg-current" : "bg-gray-300"
                    }`}
                  />
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {order.status === status && (
                    <span className="ml-auto float-right text-xs">✓ Current</span>
                  )}
                </button>
              ))}
            </div>

            {updatingStatus && (
              <div className="flex items-center gap-2 mt-3 text-xs text-secondary">
                <div className="w-3 h-3 border border-secondary border-t-transparent rounded-full animate-spin" />
                Updating…
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
