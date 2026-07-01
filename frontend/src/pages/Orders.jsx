import { useEffect, useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiClock,
  FiFilter,
  FiPhone,
  FiRefreshCw,
  FiSearch,
  FiShoppingBag,
  FiTruck,
} from "react-icons/fi";
import "./Orders.css";
import { getShoppingOrders, updateShoppingOrderStatus } from "../services/shoppingService";

const orderStatuses = ["Placed", "Packing", "Ready", "Collected", "Cancelled"];
const orderFilters = ["Open", ...orderStatuses, "All"];

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function Orders() {
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState("Open");
  const [orderSearch, setOrderSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const orderData = await getShoppingOrders();
      setOrders(Array.isArray(orderData) ? orderData : []);
    } catch (err) {
      console.log(err);
      setError("Orders load failed. Please check backend and database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const query = orderSearch.trim().toLowerCase();
    return orders.filter((item) => {
      const matchesFilter =
        orderFilter === "All" ||
        item.status === orderFilter ||
        (orderFilter === "Open" && !["Collected", "Cancelled"].includes(item.status));
      const matchesSearch =
        !query ||
        [item.customer_name, item.mobile, item.status, item.id]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      return matchesFilter && matchesSearch;
    });
  }, [orderFilter, orderSearch, orders]);

  const orderStats = useMemo(
    () => ({
      total: orders.length,
      open: orders.filter((item) => !["Collected", "Cancelled"].includes(item.status)).length,
      ready: orders.filter((item) => item.status === "Ready").length,
      collected: orders.filter((item) => item.status === "Collected").length,
    }),
    [orders]
  );

  const showSuccess = (text) => {
    setError("");
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2500);
  };

  const changeStatus = async (id, status) => {
    try {
      setError("");
      const result = await updateShoppingOrderStatus(id, status);
      showSuccess(result.message || "Order status updated.");
      await loadOrders();
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Status update failed.");
    }
  };

  return (
    <div className="orders-page">
      <div className="orders-header">
        <div>
          <span className="orders-kicker">
            <FiShoppingBag /> Order Desk
          </span>
          <h1>Orders</h1>
          <p>Track every shopping order from placed to collected.</p>
        </div>
        <button className="refresh-btn" type="button" onClick={loadOrders}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {(message || error) && <div className={error ? "orders-alert error" : "orders-alert success"}>{error || message}</div>}

      <section className="orders-stats" aria-label="Orders summary">
        <div className="order-stat-card">
          <FiShoppingBag />
          <span>Total Orders</span>
          <strong>{orderStats.total}</strong>
        </div>
        <div className="order-stat-card">
          <FiClock />
          <span>Open Orders</span>
          <strong>{orderStats.open}</strong>
        </div>
        <div className="order-stat-card ready">
          <FiTruck />
          <span>Ready</span>
          <strong>{orderStats.ready}</strong>
        </div>
        <div className="order-stat-card collected">
          <FiCheckCircle />
          <span>Collected</span>
          <strong>{orderStats.collected}</strong>
        </div>
      </section>

      <section className="orders-panel">
        <div className="section-title-row">
          <div>
            <h2>Order Lists</h2>
            <p>Move each order from placed to collected as the work finishes.</p>
          </div>
          <div className="orders-tools">
            <label className="control-with-icon compact">
              <FiSearch />
              <input value={orderSearch} onChange={(event) => setOrderSearch(event.target.value)} placeholder="Search orders..." />
            </label>
            <label className="control-with-icon compact">
              <FiFilter />
              <select value={orderFilter} onChange={(event) => setOrderFilter(event.target.value)}>
                {orderFilters.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="orders-grid">
          {loading ? (
            <div className="empty-orders">Loading orders...</div>
          ) : filteredOrders.length ? (
            filteredOrders.map((item) => (
              <article className="order-card" key={item.id}>
                <div className="order-top">
                  <div>
                    <strong>#{item.id} {item.customer_name}</strong>
                    <span>{formatDateTime(item.pickup_time)}</span>
                  </div>
                  <span className={`order-status-pill ${item.status?.toLowerCase()}`}>{item.status}</span>
                </div>

                {item.mobile && (
                  <div className="order-contact">
                    <FiPhone />
                    <span>{item.mobile}</span>
                  </div>
                )}

                <div className="order-status-row">
                  <select value={item.status} onChange={(event) => changeStatus(item.id, event.target.value)}>
                    {orderStatuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div className="order-products-list">
                  {item.items && item.items.length > 0 ? (
                    item.items.map((product, index) => (
                      <div className="order-product-item" key={`${item.id}-${product.product_name}-${index}`}>
                        <span className="product-name">
                          {index + 1}. {product.product_name}
                        </span>
                        <span className="product-qty">Qty: {product.quantity}</span>
                      </div>
                    ))
                  ) : (
                    <p className="order-empty-products">No products available.</p>
                  )}
                </div>

                <div className="order-bottom">
                  <span><FiTruck /> {item.status === "Ready" ? "Customer can collect order" : "Prepare order"}</span>
                  <b>{formatMoney(item.total_amount)}</b>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-orders">No orders found.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Orders;
