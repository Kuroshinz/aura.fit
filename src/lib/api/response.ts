export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
}

export function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message })
  };
}

export function createErrorResponse(code: string, message: string, details?: Record<string, any>): ApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details })
    },
  };
}
