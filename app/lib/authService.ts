// Auth service for Next.js - matches React Native implementation

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://api.glimznow.com/api';

export interface ApiResponse<T> {
  status: boolean;
  code: number;
  message: string;
  data?: T;
  error?: string;
}

export interface LoginRequest {
  mobile_no: string;
}

export interface LoginResponse {
  otp?: string;
  user: {
    user_id: number;
    uuid: string;
    mobile_no: string;
    is_creator: number | null;
    is_deleted: number;
    created_at: string;
    updated_at: string;
  };
}

export interface OtpVerifyRequest {
  mobile_no: string;
  otp: string;
}

export interface OtpVerifyResponse {
  auth_token: string;
  uuid: string;
  user: {
    user_id: number;
    uuid: string;
    mobile_no: string;
    is_creator: number | null;
    is_deleted: number;
    created_at: string;
    updated_at: string;
    otp_verified: number;
    createdAt: string;
    updatedAt: string;
  };
}

export interface ResendOtpRequest {
  mobile_no: string;
}

export interface ResendOtpResponse {
  otp?: string;
}

export interface CreateCreatorRequest {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  channel_name: string;
  channel_link: string;
  subscribers: string;
  content_length: string;
}

export interface CreateViewerRequest {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
}

export interface CreatorDetail {
  creator_id: number;
  user_id: number;
  uuid: string;
  username: string;
  first_name: string;
  last_name: string;
  mobile_no: string;
  email: string;
  channel_name: string;
  channel_link: string;
  subscribers: string;
  content_length: string;
  genre?: any;
  status: number;
  profile_image?: string;
  is_deleted: number;
  created_at: string;
  updated_at: string;
  createdAt: string;
  updatedAt: string;
}

export interface ViewerDetail {
  viewer_id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_image?: string;
  is_deleted: number;
  created_at: string;
  updated_at: string;
}

class AuthService {
  /**
   * Send OTP to mobile number (Login/Signup)
   */
  async login(mobileNumber: string): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ mobile_no: mobileNumber }),
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        status: false,
        code: 500,
        message: 'Login failed',
        error: error.message,
      };
    }
  }

  /**
   * Verify OTP and get auth token
   */
  async verifyOtp(mobileNumber: string, otp: string): Promise<ApiResponse<OtpVerifyResponse>> {
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ mobile_no: mobileNumber, otp }),
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        status: false,
        code: 500,
        message: 'OTP verification failed',
        error: error.message,
      };
    }
  }

  /**
   * Resend OTP
   */
  async resendOtp(mobileNumber: string): Promise<ApiResponse<ResendOtpResponse>> {
    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ mobile_no: mobileNumber }),
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        status: false,
        code: 500,
        message: 'Resend OTP failed',
        error: error.message,
      };
    }
  }

  /**
   * Create creator profile
   */
  async createCreator(data: CreateCreatorRequest): Promise<ApiResponse<CreatorDetail>> {
    try {
      const response = await fetch('/api/auth/create-creator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      return {
        status: false,
        code: 500,
        message: 'Creator registration failed',
        error: error.message,
      };
    }
  }

  /**
   * Get creator details
   */
  async getCreatorDetail(): Promise<ApiResponse<CreatorDetail>> {
    try {
      const response = await fetch('/api/auth/get-creator-detail', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        status: false,
        code: 500,
        message: 'Failed to get creator details',
        error: error.message,
      };
    }
  }

  /**
   * Create viewer profile
   */
  async createViewer(data: CreateViewerRequest): Promise<ApiResponse<ViewerDetail>> {
    try {
      const response = await fetch('/api/auth/create-viewer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        status: false,
        code: 500,
        message: 'Viewer registration failed',
        error: error.message,
      };
    }
  }

  /**
   * Get viewer details
   */
  async getViewerDetail(): Promise<ApiResponse<ViewerDetail>> {
    try {
      const response = await fetch('/api/auth/get-viewer-detail', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        status: false,
        code: 500,
        message: 'Failed to get viewer details',
        error: error.message,
      };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error: any) {
      console.error('Logout error:', error);
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

