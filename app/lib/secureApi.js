// Secure client wrapper that talks to our Next.js API routes

const userDetailsCache = { data: null, timestamp: 0, inflight: null };

export const secureApi = {
  async sendOTP(mobileNo) {
    const resp = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ mobileNo })
    });
    return await resp.json();
  },

  async verifyOTP(mobileNo, otp) {
    const resp = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ mobileNo, otp })
    });
    return await resp.json();
  },

  async resendOTP(mobileNo) {
    const resp = await fetch('/api/auth/resend-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ mobileNo })
    });
    return await resp.json();
  },

  async createUser(userData, userType) {
    const resp = await fetch('/api/user/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...userData, userType })
    });
    return await resp.json();
  },

  async getUserDetails({ force = false } = {}) {
    const now = Date.now();
    const isCacheValid = !force && userDetailsCache.data && now - userDetailsCache.timestamp < 30000;
    if (isCacheValid) return userDetailsCache.data;
    if (userDetailsCache.inflight) return await userDetailsCache.inflight;

    userDetailsCache.inflight = (async () => {
      const resp = await fetch('/api/user/details', { method: 'GET', credentials: 'include' });
      const data = await resp.json();
      if (data && data.status) {
        userDetailsCache.data = data;
        userDetailsCache.timestamp = Date.now();
      }
      userDetailsCache.inflight = null;
      return data;
    })();

    return await userDetailsCache.inflight;
  },

  async logout() {
    const resp = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    const data = await resp.json();
    userDetailsCache.data = null;
    userDetailsCache.timestamp = 0;
    userDetailsCache.inflight = null;
    return data;
  },

  isAuthenticated() {
    return true;
  }
};


