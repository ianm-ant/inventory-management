import axios from "axios";

const API_BASE_URL = "http://localhost:8001/api";

function buildFilterParams(filters = {}) {
  const params = new URLSearchParams();
  for (const key of ["warehouse", "category", "status", "month"]) {
    if (filters[key] && filters[key] !== "all")
      params.append(key, filters[key]);
  }
  return params;
}

export const api = {
  async getInventory(filters = {}) {
    const params = buildFilterParams(filters);
    const response = await axios.get(
      `${API_BASE_URL}/inventory?${params.toString()}`,
    );
    return response.data;
  },

  async getInventoryItem(id) {
    const response = await axios.get(`${API_BASE_URL}/inventory/${id}`);
    return response.data;
  },

  async getOrders(filters = {}) {
    const params = buildFilterParams(filters);
    const response = await axios.get(
      `${API_BASE_URL}/orders?${params.toString()}`,
    );
    return response.data;
  },

  async getOrder(id) {
    const response = await axios.get(`${API_BASE_URL}/orders/${id}`);
    return response.data;
  },

  async getQuarterlyReports(filters = {}) {
    const params = buildFilterParams(filters);
    const response = await axios.get(
      `${API_BASE_URL}/reports/quarterly?${params.toString()}`,
    );
    return response.data;
  },

  async getMonthlyTrends(filters = {}) {
    const params = buildFilterParams(filters);
    const response = await axios.get(
      `${API_BASE_URL}/reports/monthly-trends?${params.toString()}`,
    );
    return response.data;
  },

  async getDemandForecasts() {
    const response = await axios.get(`${API_BASE_URL}/demand`);
    return response.data;
  },

  async getBacklog() {
    const response = await axios.get(`${API_BASE_URL}/backlog`);
    return response.data;
  },

  async getDashboardSummary(filters = {}) {
    const params = buildFilterParams(filters);
    const response = await axios.get(
      `${API_BASE_URL}/dashboard/summary?${params.toString()}`,
    );
    return response.data;
  },

  async getSpendingSummary() {
    const response = await axios.get(`${API_BASE_URL}/spending/summary`);
    return response.data;
  },

  async getMonthlySpending() {
    const response = await axios.get(`${API_BASE_URL}/spending/monthly`);
    return response.data;
  },

  async getCategorySpending() {
    const response = await axios.get(`${API_BASE_URL}/spending/categories`);
    return response.data;
  },

  async getTransactions() {
    const response = await axios.get(`${API_BASE_URL}/spending/transactions`);
    return response.data;
  },

  async getTasks() {
    const response = await axios.get(`${API_BASE_URL}/tasks`);
    return response.data;
  },

  async createTask(taskData) {
    const response = await axios.post(`${API_BASE_URL}/tasks`, taskData);
    return response.data;
  },

  async deleteTask(taskId) {
    const response = await axios.delete(`${API_BASE_URL}/tasks/${taskId}`);
    return response.data;
  },

  async toggleTask(taskId) {
    const response = await axios.patch(`${API_BASE_URL}/tasks/${taskId}`);
    return response.data;
  },

  async createPurchaseOrder(purchaseOrderData) {
    const response = await axios.post(
      `${API_BASE_URL}/purchase-orders`,
      purchaseOrderData,
    );
    return response.data;
  },

  async getPurchaseOrderByBacklogItem(backlogItemId) {
    const response = await axios.get(
      `${API_BASE_URL}/purchase-orders/${backlogItemId}`,
    );
    return response.data;
  },
};
