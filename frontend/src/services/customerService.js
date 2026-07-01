import axios from "axios";

const API_URL =
    "http://localhost:5000/api/customers";

export const getCustomers = async () => {
    return axios.get(API_URL);
};

export const addCustomer = async (data) => {
    return axios.post(
        `${API_URL}/add`,
        data
    );
};

export const deleteCustomer = async (id) => {
    return axios.delete(
        `${API_URL}/${id}`
    );
};

export const updateCustomer = async (id, data) => {
    return axios.put(
        `${API_URL}/${id}`,
        data
    );
};

export const getCustomerTransactions = async (customerId) => {
    return axios.get(
        `${API_URL}/${customerId}/transactions`
    );
};

export const addCustomerProductEntry = async (customerId, data) => {
    return axios.post(
        `${API_URL}/${customerId}/product-entry`,
        data
    );
};

export const updateCustomerProductEntry = async (customerId, entryId, data) => {
    return axios.put(
        `${API_URL}/${customerId}/product-entry/${entryId}`,
        data
    );
};

export const deleteCustomerProductEntry = async (customerId, entryId) => {
    return axios.delete(
        `${API_URL}/${customerId}/product-entry/${entryId}`
    );
};

export const getCustomerHistory = async (customerId) => {
    return axios.get(
        `${API_URL}/${customerId}/history`
    );
};
