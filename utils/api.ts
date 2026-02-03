// API utility for communicating with Express server

const SERVER_URL =
  process.env.EXPO_PUBLIC_SERVER_URL || "http://10.66.160.11:3000";

const API_BASE = `${SERVER_URL}/api`;

interface ApiResponse<T = any> {
  success?: boolean;
  error?: string;
  message?: string;
  data?: T;
  user?: any;
  bankAccounts?: any[];
  transactions?: any[];
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const api = {
  async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE}${endpoint}`;

    const defaultHeaders = {
      "Content-Type": "application/json",
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(response.status, data.error || "Request failed");
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, "Network error or server unavailable");
    }
  },

  // Authentication endpoints
  async createAccount(
    userData: {
      firstName: string;
      lastName: string;
      username: string;
      email: string;
    },
    clerkUserId: string,
  ) {
    return this.request("/auth/create-account", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clerkUserId}`,
      },
      body: JSON.stringify(userData),
    });
  },

  async createUserTransactionPin(pin: string, clerkUserId: string) {
    return this.request("/auth/create-transaction-pin", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clerkUserId}`,
      },
      body: JSON.stringify({ pin }),
    });
  },

  async checkTransactionPin(clerkUserId: string) {
    return this.request("/auth/check-transaction-pin", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${clerkUserId}`,
      },
    });
  },

  async getUserData(clerkUserId: string) {
    return this.request("/auth/get-user-data", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clerkUserId}`,
      },
      body: JSON.stringify({ clerkUserId }),
    });
  },

  async checkUser(emailOrUsername: string) {
    return this.request("/auth/check-user", {
      method: "POST",
      body: JSON.stringify({
        email: emailOrUsername.includes("@") ? emailOrUsername : undefined,
        username: !emailOrUsername.includes("@") ? emailOrUsername : undefined,
      }),
    });
  },

  // Transaction endpoints
  async transferMoney(data: any, clerkUserId: string) {
    return this.request("/transactions/transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clerkUserId}`,
      },
      body: JSON.stringify(data),
    });
  },

  async depositMoney(data: any, clerkUserId: string) {
    return this.request("/transactions/deposit", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clerkUserId}`,
      },
      body: JSON.stringify(data),
    });
  },

  async withdrawMoney(data: any, clerkUserId: string) {
    return this.request("/transactions/withdraw", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clerkUserId}`,
      },
      body: JSON.stringify(data),
    });
  },

  async convertMoney(data: any, clerkUserId: string) {
    return this.request("/transactions/convert", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clerkUserId}`,
      },
      body: JSON.stringify(data),
    });
  },

  async fetchUserDetails(clerkUserId: string) {
    return this.request("/account/user-details", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${clerkUserId}`,
      },
    });
  },
};

export { ApiError };
