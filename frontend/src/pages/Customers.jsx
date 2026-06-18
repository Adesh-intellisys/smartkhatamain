import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getCustomers,
    deleteCustomer,
    getCustomerTransactions
} from "../services/customerService";
import "./Customers.css";

function Customers() {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, []);

    useEffect(() => {
        if (selectedCustomer) {
            fetchCustomerTransactions(selectedCustomer.id);
        }
    }, [selectedCustomer]);

    const fetchCustomers = async () => {
        try {
            const response = await getCustomers();
            setCustomers(response.data);
            if (response.data.length > 0) {
                setSelectedCustomer(response.data[0]);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const fetchCustomerTransactions = async (customerId) => {
        setLoading(true);
        try {
            const response = await getCustomerTransactions(customerId);
            setTransactions(response.data || []);
        } catch (error) {
            console.log("Error fetching transactions:", error);
            setTransactions([]);
        }
        setLoading(false);
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this customer?"
        );
        if (!confirmDelete) return;

        try {
            await deleteCustomer(id);
            alert("Customer Deleted Successfully");
            fetchCustomers();
            if (selectedCustomer?.id === id) {
                setSelectedCustomer(null);
            }
        } catch (error) {
            console.log(error);
            alert("Delete Failed");
        }
    };

    const filteredCustomers = customers.filter((customer) =>
        customer.customer_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
        customer.mobile?.includes(searchTerm)
    );

    const getAvatarBg = (index) => {
        const colors = [
            "#FF6B6B",
            "#4ECDC4",
            "#45B7D1",
            "#FFA07A",
            "#98D8C8",
            "#F7DC6F",
            "#BB8FCE",
            "#85C1E2"
        ];
        return colors[index % colors.length];
    };

    const totalPending = customers.reduce((sum, customer) => {
        const balance = parseFloat(customer.current_balance) || 0;
        return sum + balance;
    }, 0);

    return (
        <div className="customer-page">
            <div className="customer-header">
                <div>
                    <h1>👥 Customer Management</h1>
                    <p>Manage all customer records and balances</p>
                </div>
                <button
                    className="add-btn"
                    onClick={() => navigate("/add-customer")}
                >
                    + Add Customer
                </button>
            </div>

            <div className="customer-stats">
                <div className="stat-card">
                    <h3>Total Customers</h3>
                    <h2>{customers.length}</h2>
                </div>
                <div className="stat-card">
                    <h3>Active Customers</h3>
                    <h2>{customers.length}</h2>
                </div>
                <div className="stat-card">
                    <h3>Pending Amount</h3>
                    <h2>₹{totalPending.toFixed(2)}</h2>
                </div>
                <div className="stat-card">
                    <h3>Total Transactions</h3>
                    <h2>{transactions.length}</h2>
                </div>
            </div>

            <div className="customer-main-container">
                <div className="customer-sidebar">
                    <div className="sidebar-header">
                        <h2>Customer List</h2>
                        <input
                            type="text"
                            placeholder="🔍 Search..."
                            className="search-box"
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(e.target.value)
                            }
                        />
                    </div>

                    <div className="customers-list">
                        {filteredCustomers.length > 0 ? (
                            filteredCustomers.map(
                                (customer, index) => (
                                    <div
                                        key={customer.id}
                                        className={`customer-card ${
                                            selectedCustomer?.id ===
                                            customer.id
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setSelectedCustomer(
                                                customer
                                            )
                                        }
                                    >
                                        <div className="card-content">
                                            <div
                                                className="avatar"
                                                style={{
                                                    backgroundColor:
                                                        getAvatarBg(
                                                            index
                                                        )
                                                }}
                                            >
                                                {customer.customer_name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                            <div className="card-info">
                                                <h4>
                                                    {
                                                        customer.customer_name
                                                    }
                                                </h4>
                                                <p className="paid-amount">
                                                    Paid:{" "}
                                                    <span>
                                                        ₹
                                                        {(
                                                            parseFloat(customer.opening_balance || 0) -
                                                            parseFloat(customer.current_balance || 0)
                                                        ).toFixed(
                                                            2
                                                        )}
                                                    </span>
                                                </p>
                                                <p className="pending-amount">
                                                    Pending:{" "}
                                                    <span>
                                                        ₹
                                                        {parseFloat(customer.current_balance || 0).toFixed(
                                                            2
                                                        )}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            className="delete-icon"
                                            onClick={(e) =>
                                                handleDelete(
                                                    customer.id,
                                                    e
                                                )
                                            }
                                            title="Delete customer"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )
                            )
                        ) : (
                            <div className="no-customers">
                                No customers found
                            </div>
                        )}
                    </div>
                </div>

                <div className="customer-details">
                    {selectedCustomer ? (
                        <>
                            <div className="details-header">
                                <div className="header-info">
                                    <div
                                        className="avatar-large"
                                        style={{
                                            backgroundColor:
                                                getAvatarBg(
                                                    customers.indexOf(
                                                        selectedCustomer
                                                    )
                                                )
                                        }}
                                    >
                                        {selectedCustomer.customer_name
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>
                                    <div>
                                        <h2>
                                            {
                                                selectedCustomer.customer_name
                                            }
                                        </h2>
                                        <p>
                                            {selectedCustomer.mobile}
                                        </p>
                                        <p>
                                            {selectedCustomer.address}
                                        </p>
                                    </div>
                                </div>
                                <div className="header-stats">
                                    <div className="stat">
                                        <span className="label">
                                            Paid Amount
                                        </span>
                                        <span className="value green">
                                            ₹
                                            {(
                                                parseFloat(selectedCustomer.opening_balance || 0) -
                                                parseFloat(selectedCustomer.current_balance || 0)
                                            ).toFixed(
                                                2
                                            )}
                                        </span>
                                    </div>
                                    <div className="stat">
                                        <span className="label">
                                            Pending Amount
                                        </span>
                                        <span className="value red">
                                            ₹
                                            {parseFloat(selectedCustomer.current_balance || 0).toFixed(
                                                2
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="transaction-history">
                                <h3>Transaction History</h3>
                                {loading ? (
                                    <p className="loading">
                                        Loading transactions...
                                    </p>
                                ) : transactions.length > 0 ? (
                                    <div className="transaction-table">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>
                                                        Date
                                                    </th>
                                                    <th>
                                                        Product
                                                        Name
                                                    </th>
                                                    <th>
                                                        Price
                                                    </th>
                                                    <th>
                                                        Paid
                                                        Amount
                                                    </th>
                                                    <th>
                                                        Pending
                                                        Amount
                                                    </th>
                                                    <th>
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {transactions.map(
                                                    (
                                                        transaction
                                                    ) => (
                                                        <tr
                                                            key={
                                                                transaction.id
                                                            }
                                                        >
                                                            <td>
                                                                {new Date(
                                                                    transaction.created_at
                                                                ).toLocaleDateString(
                                                                    "en-IN"
                                                                )}
                                                            </td>
                                                            <td>
                                                                {
                                                                    transaction.product_name
                                                                }
                                                            </td>
                                                            <td>
                                                                ₹
                                                                {parseFloat(
                                                                    transaction.amount
                                                                ).toFixed(
                                                                    2
                                                                )}
                                                            </td>
                                                            <td>
                                                                ₹
                                                                {parseFloat(
                                                                    transaction.paid_amount ||
                                                                        0
                                                                ).toFixed(
                                                                    2
                                                                )}
                                                            </td>
                                                            <td>
                                                                ₹
                                                                {parseFloat(
                                                                    transaction.pending_amount ||
                                                                        0
                                                                ).toFixed(
                                                                    2
                                                                )}
                                                            </td>
                                                            <td>
                                                                <span
                                                                    className={`status ${
                                                                        transaction.status ===
                                                                        "completed"
                                                                            ? "completed"
                                                                            : "pending"
                                                                    }`}
                                                                >
                                                                    {
                                                                        transaction.status
                                                                    }
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="no-transactions">
                                        No transactions found
                                    </p>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="no-selection">
                            <p>Select a customer to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Customers;