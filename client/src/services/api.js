import axios from 'axios';

const API_CONFIG_KEY = "campus_api_config";
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
const API_PATH = "/api";

const normalizeApiUrl = (url) => {
  if (!url) {
    return API_PATH;
  }

  const trimmed = url.trim().replace(/\/+$/g, "");

  if (trimmed === "") {
    return API_PATH;
  }

  if (trimmed.endsWith(API_PATH)) {
    return trimmed;
  }

  return `${trimmed}${API_PATH}`;
};

class APIConfig {
  constructor() {
    this.apiUrl = normalizeApiUrl(import.meta.env.VITE_API_URL || API_PATH);
    this.backendAvailable = false;
    this.lastHealthCheck = null;
    this.healthCheckTimer = null;
    this.loadFromStorage();
    this.initHealthCheck();
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(API_CONFIG_KEY);
      if (stored) {
        const config = JSON.parse(stored);
        if (config.apiUrl) {
          this.apiUrl = normalizeApiUrl(config.apiUrl);
        }
      }
    } catch (error) {
      console.warn("Failed to load API config from storage:", error);
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(API_CONFIG_KEY, JSON.stringify({
        apiUrl: this.apiUrl,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.warn("Failed to save API config:", error);
    }
  }

  setApiUrl(url) {
    this.apiUrl = normalizeApiUrl(url);
    this.saveToStorage();
  }

  async checkHealth() {
    try {
      const response = await axios.get(`${this.apiUrl}/health`, {
        timeout: 5000
      });
      this.backendAvailable = response.status === 200;
      this.lastHealthCheck = new Date();
      console.log(`Backend health: ${this.backendAvailable ? "✓ Connected" : "✗ Unavailable"}`);
      return this.backendAvailable;
    } catch (error) {
      this.backendAvailable = false;
      this.lastHealthCheck = new Date();
      console.warn("Backend health check failed:", error.message);
      return false;
    }
  }

  initHealthCheck() {
    this.checkHealth();

    this.healthCheckTimer = setInterval(() => {
      this.checkHealth();
    }, HEALTH_CHECK_INTERVAL);
  }

  stopHealthCheck() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
  }

  getStatus() {
    return {
      apiUrl: this.apiUrl,
      backendAvailable: this.backendAvailable,
      lastHealthCheck: this.lastHealthCheck
    };
  }

  async waitForBackend(maxRetries = 60, delayMs = 1000) {
    console.log("🔄 Waiting for backend to be ready...");
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const response = await axios.get(
          `${this.apiUrl}/health`,
          { timeout: 5000 }
        );

        if (response.status === 200) {
          this.backendAvailable = true;
          this.lastHealthCheck = new Date();
          console.log("✓ Backend is ready and connected!");
          return true;
        }
      } catch (error) {
      }

      attempt++;
      if (attempt < maxRetries) {
        console.log(
          `⏳ Backend not ready yet. Retrying... (${attempt}/${maxRetries})`
        );
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    console.error("✗ Backend failed to connect after maximum retries");
    this.backendAvailable = false;
    return false;
  }
}

const apiConfig = new APIConfig();

// Axios-based request function (headers are handled by AuthContext interceptor)
export const request = async (endpoint, options = {}) => {
  try {
    const response = await axios({
      url: `${apiConfig.apiUrl}${endpoint}`,
      method: options.method || 'GET',
      data: options.body || options.data,
      timeout: 10000,
      ...options
    });

    const responseData = response.data;
    if (Array.isArray(responseData)) {
      return {
        success: true,
        data: responseData
      };
    }

    return {
      success: true,
      ...responseData
    };
  } catch (error) {
    console.error(`API Error:`, error.message);

    return {
      success: false,
      message: error.response?.data?.message || "Something went wrong",
      error: error.message
    };
  }
};

export const getAPIStatus = () => apiConfig.getStatus();
export const setAPIUrl = (url) => apiConfig.setApiUrl(url);
export const checkBackendHealth = () => apiConfig.checkHealth();
export const stopAPIHealthChecks = () => apiConfig.stopHealthCheck();
export const waitForBackend = (maxRetries = 60, delayMs = 1000) =>
  apiConfig.waitForBackend(maxRetries, delayMs);
export const getApiUrl = () => apiConfig.apiUrl;

export const registerUser = async (data) => {
  return request("/auth/register", {
    method: "POST",
    data
  });
};

export const loginUser = async (data) => {
  return request("/auth/login", {
    method: "POST",
    data
  });
};

export const forgotPassword = async (email) => {
  return request('/auth/forgot-password', {
    method: 'POST',
    data: { email }
  });
};

export const resetPassword = async ({ email, token, newPassword }) => {
  return request('/auth/reset-password', {
    method: 'POST',
    data: { email, token, newPassword }
  });
};

export const getAllStudents = async () => {
  return request("/admin/students", {
    method: "GET"
  });
};

export const getAllCompanies = async () => {
  return request("/admin/companies", {
    method: "GET"
  });
};

export const verifyStudent = async (studentId) => {
  return request(`/admin/students/${studentId}/verify`, {
    method: "PUT"
  });
};

export const deleteStudent = async (studentId) => {
  return request(`/admin/students/${studentId}`, {
    method: "DELETE"
  });
};

export const approveCompany = async (companyId) => {
  return request(`/admin/companies/${companyId}/approve`, {
    method: "PUT"
  });
};

export const deleteCompany = async (companyId) => {
  return request(`/admin/companies/${companyId}`, {
    method: "DELETE"
  });
};

export const getPendingUsers = async () => {
  return request("/admin/pending-users", {
    method: "GET"
  });
};

export const approveUser = async (userId) => {
  return request(`/admin/users/${userId}/approve`, {
    method: "PUT"
  });
};

export const rejectUser = async (userId) => {
  return request(`/admin/users/${userId}/reject`, {
    method: "PUT"
  });
};

export const getPendingJobs = async () => {
  return request("/admin/pending-jobs", {
    method: "GET"
  });
};

export const approveJob = async (jobId) => {
  return request(`/admin/jobs/${jobId}/approve`, {
    method: "PUT"
  });
};

export const rejectJob = async (jobId) => {
  return request(`/admin/jobs/${jobId}/reject`, {
    method: "PUT"
  });
};
export const getPlacementReports = async () => {
  return request("/admin/reports", {
    method: "GET"
  });
};

export const sendEmailToUsers = async (data) => {
  return request("/admin/send-email", {
    method: "POST",
    data
  });
};

export const getAllDrives = async () => {
  return request("/admin/drives", {
    method: "GET"
  });
};

export const createDrive = async (data) => {
  return request("/admin/drives", {
    method: "POST",
    data
  });
};

export const checkBackend = async () => {
  const res = await request("/health", { method: "GET" });
  return res.success;
};

export const getAllJobs = async () => {
  return request("/jobs", {
    method: "GET"
  });
};

export const createJob = async (data) => {
  return request("/jobs", {
    method: "POST",
    data
  });
};

export const applyJob = async (jobId) => {
  return request("/applications/apply", {
    method: "POST",
    data: { jobId }
  });
};

export const getMyApplications = async () => {
  return request("/applications/my-applications", {
    method: "GET"
  });
};

export const getCompanyApplications = async () => {
  return request("/applications/company-applications", {
    method: "GET"
  });
};

export const updateApplicationStatus = async (applicationId, status) => {
  return request(`/applications/status/${applicationId}`, {
    method: "PUT",
    data: { status }
  });
};

export const getUserProfile = async () => {
  return request("/profile/me", {
    method: "GET"
  });
};

export const updateContactInfo = async (data) => {
  return request("/profile/contact", {
    method: "PATCH",
    data
  });
};

export const updateBasicInfo = async (data) => {
  return request("/profile/basic-info", {
    method: "PATCH",
    data
  });
};

export const updateAcademicInfo = async (data) => {
  return request("/profile/academic-info", {
    method: "PATCH",
    data
  });
};

export const getProfileCompletion = async () => {
  return request("/profile/completion", {
    method: "GET"
  });
};