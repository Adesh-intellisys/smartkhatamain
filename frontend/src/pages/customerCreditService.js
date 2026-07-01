import api from "../services/api";

export const getCredits = async () => {
  const response = await api.get("/customer-credits");
  return response.data;
};

export const addCredit = async (creditData) => {
  const response = await api.post("/customer-credits", creditData);
  return response.data;
};

export const updateCredit = async (id, creditData) => {
  const response = await api.put(`/customer-credits/${id}`, creditData);
  return response.data;
};

export const deleteCredit = async (id) => {
  const response = await api.delete(`/customer-credits/${id}`);
  return response.data;
};
