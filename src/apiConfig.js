// src/apiConfig.js
export const API_BASE_URL = "https://ubill-tenantapi.maccloud.in/api";
export const DASHBOARD_BASE_URL = "https://ibmapi.maccloud.in/api";


export const ENDPOINTS = {
  login: "/login",
  contractsByClient: "/get-contracts-by-client",
  ownerContractsByClient: "/get-owner-contracts-by-client",
  billHistory: "/bill-history",          // POST
  paymentHistory: "/payment-history",    // POST
  approvedClient: "/get-approved-client",
  finalBillRequest: "/final-bill-request-get",
  customerDashboard: "/Cust_Dashboard",
  raiseTicket: "/ServiceTicketAdd",
  clientMeters: "/client-meters",
};

const apiGetDashboard = async (endpoint, params = {}) => {
  const url = new URL(DASHBOARD_BASE_URL + endpoint);

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) {
      url.searchParams.append(k, String(v));
    }
  });

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
};

/* ------------------ GENERIC GET ------------------ */
const apiGet = async (endpoint, params = {}, options = {}) => {
  const url = new URL(API_BASE_URL + endpoint);

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) {
      url.searchParams.append(k, String(v));
    }
  });

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
};


/* ------------------ GENERIC POST ------------------ */
const apiPost = async (endpoint, body = {}, options = {}) => {
  const res = await fetch(API_BASE_URL + endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
};

/* ------------------ API FUNCTIONS ------------------ */
export const loginUser = (email, password) =>
  apiPost(ENDPOINTS.login, {
    UserId: email,
    Password: password,
  });

  // GET – Tenant contracts
export const getContractsByClient = (clientId) =>
  apiGet(ENDPOINTS.contractsByClient, { clientId });

// GET – Owner contracts
export const getOwnerContractsByClient = (clientId) =>
  apiGet(ENDPOINTS.ownerContractsByClient, { clientId });

// GET
export const getApprovedClient = (userId) =>
  apiGet(ENDPOINTS.approvedClient, { userId });

export const getFinalBillRequest = (userId, officeId) =>
  apiGet(ENDPOINTS.finalBillRequest, {
    userId,
    officeid: officeId, // backend requires lowercase
  });

// POST
export const getBillHistory = ({
  key,
  fromDate,
  toDate,
  byOffice = false,
  officeIds = "",
  clientIds,
}) =>
  apiPost(ENDPOINTS.billHistory, {
    key,
    FromDate: fromDate,
    ToDate: toDate,
    Byoffice: byOffice,
    OfficeIds: officeIds,
    ClientIds: clientIds,
  });

export const getPaymentHistory = ({
  key,
  fromDate,
  toDate,
  byOffice = false,
  officeIds = "",
  clientIds,
}) =>
  apiPost(ENDPOINTS.paymentHistory, {
    key,
    FromDate: fromDate,
    ToDate: toDate,
    Byoffice: byOffice,
    OfficeIds: officeIds,
    ClientIds: clientIds,
  });

// GET – Dashboard summary (CORRECT SERVER)
export const getCustomerDashboard = (key) =>
  apiGetDashboard("/Cust_Dashboard", { Key: key });

export const getOwnerBuildings = async (loginKey) => {
  return apiGet("/get-owner-buildings", {}, { authToken: loginKey });
};

// POST – Raise service ticket (CORRECT SERVER)
export const raiseServiceTicket = async (payload) => {
  const res = await fetch(`${DASHBOARD_BASE_URL}/ServiceTicketAdd`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
};

// GET – Client meters (for dropdown)
export const getClientMeters = (loginKey) =>
  apiGet(ENDPOINTS.clientMeters, { loginKey });
