import api from "./api";

export const getStaffSummary = async () => {
  const response = await api.get("/staff/summary");
  return response.data;
};

export const getStaff = async () => {
  const response = await api.get("/staff");
  return response.data;
};

export const addStaff = async (data) => {
  const response = await api.post("/staff", data);
  return response.data;
};

export const updateStaff = async (id, data) => {
  const response = await api.put(`/staff/${id}`, data);
  return response.data;
};

export const deleteStaff = async (id) => {
  const response = await api.delete(`/staff/${id}`);
  return response.data;
};

export const getStaffHistory = async (id) => {
  const response = await api.get(`/staff/${id}/history`);
  return response.data;
};

export const addStaffAttendance = async (id, data) => {
  const response = await api.post(`/staff/${id}/attendance`, data);
  return response.data;
};

export const addStaffSalaryPayment = async (id, data) => {
  const response = await api.post(`/staff/${id}/salary-payments`, data);
  return response.data;
};

export const addStaffAdvancePayment = async (id, data) => {
  const response = await api.post(`/staff/${id}/advances`, data);
  return response.data;
};
