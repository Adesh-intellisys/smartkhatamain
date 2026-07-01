import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBoxOpen,
  FaClipboardList,
  FaCreditCard,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaShoppingBag,
  FaTruck,
  FaUserPlus,
  FaUsers,
  FaWallet,
} from "react-icons/fa";

import { getCredits } from "./customerCreditService";
import { getInventoryProducts } from "../services/inventoryService";
import { getPayments } from "./paymentService";
import { getShoppingOrders } from "../services/shoppingService";
import { getCustomers } from "../services/customerService";
import "./Dashboard.css";

const fallbackTransactions = [
  { id: "t1", name: "Amit Sharma", type: "Credit", amount: 5000, date: "2026-06-13", status: "Pending" },
  { id: "t2", name: "Ramesh Gupta", type: "Payment", amount: 3000, date: "2026-06-12", status: "Completed" },
  { id: "t3", name: "Suresh Yadav", type: "Credit", amount: 2500, date: "2026-06-11", status: "Pending" },
  { id: "t4", name: "Priya Patil", type: "Payment", amount: 4500, date: "2026-06-10", status: "Completed" },
  { id: "t5", name: "Neha Singh", type: "Credit", amount: 7000, date: "2026-06-09", status: "Pending" },
  { id: "t6", name: "Vikas Kumar", type: "Order", amount: 6200, date: "2026-06-08", status: "Processing" },
];

const fallbackProducts = [
  { name: "Tata Salt", sales: 96 },
  { name: "Parle G", sales: 88 },
  { name: "Colgate", sales: 74 },
  { name: "Aashirvaad", sales: 68 },
  { name: "Maggi", sales: 63 },
  { name: "Dove Soap", sales: 55 },
  { name: "Surf Excel", sales: 48 },
  { name: "Red Label", sales: 39 },
  { name: "Good Day", sales: 33 },
  { name: "Clinic Plus", sales: 26 },
];

const monthlyProfitLoss = [
  { month: "Jan", profit: 42000, loss: 9000 },
  { month: "Feb", profit: 36000, loss: 11000 },
  { month: "Mar", profit: 51000, loss: 8000 },
  { month: "Apr", profit: 47000, loss: 14000 },
  { month: "May", profit: 62000, loss: 12000 },
  { month: "Jun", profit: 58000, loss: 10000 },
];

const fallbackLowStock = [
  { product: "Tata Salt", stock: 2 },
  { product: "Colgate", stock: 1 },
  { product: "Parle G", stock: 4 },
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "Today";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return String(date);

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

const getArrayData = (result) => {
  if (result.status !== "fulfilled") return [];
  const value = result.value?.data ?? result.value;
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.products)) return value.products;
  if (Array.isArray(value?.orders)) return value.orders;
  if (Array.isArray(value?.customers)) return value.customers;
  return [];
};

const getNumber = (...values) => {
  const found = values.find((value) => value !== undefined && value !== null && value !== "");
  return Number(found) || 0;
};

function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [activeAmount, setActiveAmount] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    customers: [],
    credits: [],
    payments: [],
    orders: [],
    products: [],
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      const [customersResult, creditsResult, paymentsResult, ordersResult, productsResult] =
        await Promise.allSettled([
          getCustomers(),
          getCredits(),
          getPayments(),
          getShoppingOrders(),
          getInventoryProducts(),
        ]);

      if (!isMounted) return;

      setDashboardData({
        customers: getArrayData(customersResult),
        credits: getArrayData(creditsResult),
        payments: getArrayData(paymentsResult),
        orders: getArrayData(ordersResult),
        products: getArrayData(productsResult),
        loading: false,
      });
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const creditTotal = useMemo(() => {
    const total = dashboardData.credits.reduce(
      (sum, item) => sum + getNumber(item.amount, item.credit_amount, item.total_amount),
      0
    );

    return total || 245000;
  }, [dashboardData.credits]);

  const paymentTotal = useMemo(() => {
    const total = dashboardData.payments.reduce(
      (sum, item) => sum + getNumber(item.amount, item.payment_amount, item.paid_amount),
      0
    );

    return total || 175000;
  }, [dashboardData.payments]);

  const pendingTotal = Math.max(creditTotal - paymentTotal, 0);
  const totalAmount = Math.max(creditTotal, paymentTotal + pendingTotal, 1);
  const paidPercentage = Math.round((paymentTotal / totalAmount) * 100);
  const pendingPercentage = Math.max(100 - paidPercentage, 0);

  const transactions = useMemo(() => {
    const creditRows = dashboardData.credits.map((item, index) => ({
      id: `credit-${item.id ?? index}`,
      name: item.customer_name || item.name || item.supplier_name || "Credit Customer",
      type: "Credit",
      amount: getNumber(item.amount, item.credit_amount, item.total_amount),
      date: item.credit_date || item.date || item.created_at,
      status: "Pending",
    }));

    const paymentRows = dashboardData.payments.map((item, index) => ({
      id: `payment-${item.id ?? index}`,
      name: item.customer_name || item.name || "Payment Customer",
      type: "Payment",
      amount: getNumber(item.amount, item.payment_amount, item.paid_amount),
      date: item.payment_date || item.date || item.created_at,
      status: "Completed",
    }));

    const orderRows = dashboardData.orders.map((item, index) => ({
      id: `order-${item.id ?? index}`,
      name: item.customer_name || item.customer || item.name || "Order",
      type: "Order",
      amount: getNumber(item.total_amount, item.amount, item.grand_total),
      date: item.order_date || item.date || item.created_at,
      status: item.status || "Processing",
    }));

    const rows = [...creditRows, ...paymentRows, ...orderRows]
      .filter((item) => item.amount > 0)
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    return rows.length ? rows : fallbackTransactions;
  }, [dashboardData.credits, dashboardData.orders, dashboardData.payments]);

  const topProducts = useMemo(() => {
    const productMap = new Map();

    dashboardData.products.forEach((item) => {
      const name = item.product_name || item.name || item.title;
      if (!name) return;
      productMap.set(name, {
        name,
        sales: getNumber(item.sales_count, item.sold_count, item.quantity_sold, item.total_sold),
      });
    });

    dashboardData.orders.forEach((item) => {
      const name = item.product_name || item.product || item.item_name;
      if (!name) return;
      const current = productMap.get(name) || { name, sales: 0 };
      productMap.set(name, {
        name,
        sales: current.sales + getNumber(item.quantity, item.qty, item.items_count, 1),
      });
    });

    const products = [...productMap.values()]
      .filter((item) => item.sales > 0)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);

    return products.length ? products : fallbackProducts;
  }, [dashboardData.orders, dashboardData.products]);

  const lowStock = useMemo(() => {
    const stockRows = dashboardData.products
      .map((item) => ({
        product: item.product_name || item.name || "Product",
        stock: getNumber(item.stock, item.quantity, item.available_stock),
      }))
      .filter((item) => item.stock <= 5)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 3);

    return stockRows.length ? stockRows : fallbackLowStock;
  }, [dashboardData.products]);


  const topPendingCustomers = [
  {
    name: "Amit Sharma",
    amount: "₹20,000",
  },
  {
    name: "Ramesh Gupta",
    amount: "₹18,500",
  },
  {
    name: "Suresh Patil",
    amount: "₹15,000",
  },
  {
    name: "Rahul Jadhav",
    amount: "₹12,800",
  },
  {
    name: "Akshay More",
    amount: "₹10,200",
  },
];

  const activityData = [
    { title: "New Customers", value: dashboardData.customers.length || 125 },
    { title: "Credits Added", value: dashboardData.credits.length || 10 },
    { title: "Payments Received", value: dashboardData.payments.length || 8 },
    { title: "Orders Placed", value: dashboardData.orders.length || 12 },
  ];

  const maxProductSales = Math.max(...topProducts.map((item) => item.sales), 1);
  const maxMonthlyValue = Math.max(
    ...monthlyProfitLoss.map((item) => Math.max(item.profit, item.loss)),
    1
  );

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesType =
        typeFilter === "All" || transaction.type === typeFilter;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        transaction.name.toLowerCase().includes(normalizedSearch) ||
        transaction.type.toLowerCase().includes(normalizedSearch) ||
        transaction.status.toLowerCase().includes(normalizedSearch);

      return matchesType && matchesSearch;
    });
  }, [searchTerm, transactions, typeFilter]);

  const visibleTransactions = showAllTransactions
    ? filteredTransactions
    : filteredTransactions.slice(0, 5);

  const handleAmountHover = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX);
    const clockwiseFromTop = ((angle * 180) / Math.PI + 450) % 360;

    setActiveAmount(clockwiseFromTop <= paidPercentage * 3.6 ? "paid" : "pending");
  };

  const amountTooltip = activeAmount === "paid"
    ? `Paid: ${paidPercentage}% (${formatCurrency(paymentTotal)})`
    : activeAmount === "pending"
      ? `Pending: ${pendingPercentage}% (${formatCurrency(pendingTotal)})`
      : "Hover paid or pending section";

  return (
    <div className="dashboard-page">
      <div className="dashboard-title">
        <div>
          <span>Business Overview</span>
          <h1>Dashboard</h1>
          <p>Daily sales, credit, payments, orders and stock in one clear view.</p>
        </div>

        <div className="dashboard-status">
          <span className={dashboardData.loading ? "status-dot loading" : "status-dot"} />
          {dashboardData.loading ? "Syncing data" : "Live dashboard"}
        </div>
      </div>

      <div className="cards">
        <div className="card">
          <FaUsers className="card-icon" />
          <h3>Total Customers</h3>
          <h1>{dashboardData.customers.length || 125}</h1>
          <small>Active customer base</small>
        </div>

        <div className="card">
          <FaWallet className="card-icon" />
          <h3>Total Credit</h3>
          <h1>{formatCurrency(creditTotal)}</h1>
          <small>Supplier and customer credit</small>
        </div>

        <div className="card">
          <FaMoneyBillWave className="card-icon success" />
          <h3>Total Payment</h3>
          <h1>{formatCurrency(paymentTotal)}</h1>
          <small>{paidPercentage}% recovered</small>
        </div>

        <div className="card">
          <FaExclamationTriangle className="card-icon warning" />
          <h3>Pending Balance</h3>
          <h1>{formatCurrency(pendingTotal || 70000)}</h1>
          <small>Needs follow up</small>
        </div>
      </div>

      <div className="dashboard-main-grid">
        <section className="dashboard-panel transaction-panel">
          <div className="section-header">
            <div>
              <h2>Recent Transactions</h2>
              <p>Search, filter and review the latest business movement.</p>
            </div>

            <div className="header-actions">
              <input
                type="text"
                placeholder="Search customer or status"
                className="search-input"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />

              <select
                className="filter-select"
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
              >
                <option>All</option>
                <option>Credit</option>
                <option>Payment</option>
                <option>Order</option>
              </select>

              <button
                type="button"
                onClick={() => setShowAllTransactions((current) => !current)}
              >
                {showAllTransactions ? "Show Less" : "View All"}
              </button>
            </div>
          </div>

          <div className="transaction-list">
            {visibleTransactions.map((transaction) => (
              <div className="transaction-row" key={transaction.id}>
                <div className={`transaction-type ${transaction.type.toLowerCase()}`}>
                  {transaction.type === "Payment" ? <FaMoneyBillWave /> : transaction.type === "Order" ? <FaShoppingBag /> : <FaCreditCard />}
                </div>

                <div className="transaction-info">
                  <strong>{transaction.name}</strong>
                  <span>{transaction.type} - {formatDate(transaction.date)}</span>
                </div>

                <span className={`status-pill ${transaction.status.toLowerCase()}`}>
                  {transaction.status}
                </span>

                <b className={transaction.type === "Payment" ? "green" : "red"}>
                  {formatCurrency(transaction.amount)}
                </b>
              </div>
            ))}

            {visibleTransactions.length === 0 && (
              <div className="empty-table">No transactions found</div>
            )}
          </div>
        </section>

        <aside className="dashboard-stack">
          <section className="dashboard-panel quick-actions">
            <h2>Quick Actions</h2>

            <div className="quick-grid">
              <Link to="/add-customer" className="action-btn">
                <FaUserPlus />
                <span>Add Customer</span>
              </Link>

              <Link to="/supplier" className="action-btn">
                <FaTruck />
                <span>Supplier</span>
              </Link>

              <Link to="/payment" className="action-btn">
                <FaMoneyBillWave />
                <span>Add Payment</span>
              </Link>

              <Link to="/orders" className="action-btn">
                <FaClipboardList />
                <span>Orders</span>
              </Link>
            </div>
          </section>

          <section className="dashboard-panel amount-overview-card">
            <h2>Amount Overview</h2>

            <div className="amount-layout">
              <div
                className="amount-donut"
                style={{ "--paid": `${paidPercentage}%` }}
                onMouseMove={handleAmountHover}
                onMouseLeave={() => setActiveAmount(null)}
                onFocus={() => setActiveAmount("paid")}
                onBlur={() => setActiveAmount(null)}
                tabIndex="0"
                aria-label={amountTooltip}
              >
                <div className="donut-center">
                  <strong>{paidPercentage}%</strong>
                  <span>Paid</span>
                </div>
                <div className="amount-tooltip">{amountTooltip}</div>
              </div>

              <div className="amount-legend">
                <div>
                  <span className="legend-dot paid" />
                  <p>Paid Amount</p>
                  <b>{formatCurrency(paymentTotal)}</b>
                </div>
                <div>
                  <span className="legend-dot pending" />
                  <p>Pending Amount</p>
                  <b>{formatCurrency(pendingTotal || 70000)}</b>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <div className="insight-grid">
        <section className="dashboard-panel activity-card">
          <h2>Today's Activity</h2>

          {activityData.map((item) => (
            <div className="activity-item" key={item.title}>
              <span>{item.title}</span>
              <b>{item.value}</b>
            </div>
          ))}
        </section>

        <section className="dashboard-panel top-products-card">
          <div className="section-header compact">
            <div>
              <h2>Top 10 Products</h2>
              <p>Products ranked by sale count.</p>
            </div>
          </div>

          <div className="product-bars">
            {topProducts.map((item) => (
              <div className="product-bar-row" key={item.name}>
                <span title={item.name}>{item.name}</span>
                <div className="product-bar-track">
                  <div
                    className="product-bar-fill"
                    style={{ width: `${(item.sales / maxProductSales) * 100}%` }}
                  />
                </div>
                <b>{item.sales}</b>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="bottom-section">
        <section className="dashboard-panel monthly-card">
          <div className="section-header compact">
            <div>
              <h2>Monthly Summary</h2>
              <p>Month wise profit and loss overview.</p>
            </div>
          </div>

          <div className="monthly-chart">
            {monthlyProfitLoss.map((item) => {
              const netProfit = item.profit - item.loss;

              return (
                <div className="monthly-bar-item" key={item.month}>
                  <span>{formatCurrency(netProfit)}</span>
                  <div className="monthly-bars">
                    <div
                      className="monthly-bar profit"
                      style={{ height: `${(item.profit / maxMonthlyValue) * 100}%` }}
                      title={`Profit ${formatCurrency(item.profit)}`}
                    />
                    <div
                      className="monthly-bar loss"
                      style={{ height: `${(item.loss / maxMonthlyValue) * 100}%` }}
                      title={`Loss ${formatCurrency(item.loss)}`}
                    />
                  </div>
                  <b>{item.month}</b>
                </div>
              );
            })}
          </div>

          <div className="chart-legend">
            <span><i className="legend-dot paid" /> Profit</span>
            <span><i className="legend-dot pending" /> Loss</span>
          </div>
        </section>

        <section className="dashboard-panel outstanding-card">
          <h2>Top Pending Customer</h2>
          <div className="dashboard-summary-card">

  {topPendingCustomers.map((customer, index) => (
    <div className="pending-customer-row" key={index}>
      <div className="pending-customer-left">
        <div className="customer-avatar">
          {customer.name.charAt(0)}
        </div>

        <div>
          <h4>{customer.name}</h4>
          <span>Pending Customer</span>
        </div>
      </div>

      <div className="pending-customer-amount">
        {customer.amount}
      </div>
    </div>
  ))}
</div>

          
        </section>

        <section className="dashboard-panel low-stock-card">
          <h2>Low Stock Alerts</h2>

          {lowStock.map((item) => (
            <div className="stock-item" key={item.product}>
              <span><FaBoxOpen /> {item.product}</span>
              <b>{item.stock} Left</b>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
