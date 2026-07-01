import api from "./api";

export const getInventorySummary = async () => {
  const response = await api.get("/inventory/summary");
  return response.data;
};

export const getInventoryProducts = async () => {
  const response = await api.get("/inventory/products");
  return response.data;
};

export const addInventoryProduct = async (data) => {
  const response = await api.post("/inventory/products", data);
  return response.data;
};

export const updateInventoryProduct = async (id, data) => {
  const response = await api.put(`/inventory/products/${id}`, data);
  return response.data;
};

export const updateProductStock = async (id, data) => {
  const response = await api.patch(`/inventory/products/${id}/stock`, data);
  return response.data;
};

export const deleteInventoryProduct = async (id) => {
  const response = await api.delete(`/inventory/products/${id}`);
  return response.data;
};

export const getStockHistory = async () => {
  const response = await api.get("/inventory/history");
  return response.data;
};
