import api from "./api";

export const getShoppingProducts = async () => {
  const response = await api.get("/shopping/products");
  return response.data;
};

export const getShoppingOrders = async () => {
  const response = await api.get("/shopping/orders");
  return response.data;
};

export const createShoppingOrder = async (data) => {
  const response = await api.post("/shopping/orders", data);
  return response.data;
};

export const updateShoppingOrderStatus = async (id, status) => {
  const response = await api.patch(
    `/shopping/orders/${id}/status`,
    { status }
  );
  return response.data;
};

export const addProduct = async (data) => {
  const response = await api.post(
    "/shopping/products",
    data
  );
  return response.data;
};

export const updateProduct = async (id, data) => {
  const response = await api.put(
    `/shopping/products/${id}`,
    data
  );
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(
    `/shopping/products/${id}`
  );
  return response.data;
};