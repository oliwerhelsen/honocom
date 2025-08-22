export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export class ResponseUtils {
  static success<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    };
  }

  static error(error: string, message?: string): ApiResponse {
    return {
      success: false,
      error,
      message,
      timestamp: new Date().toISOString()
    };
  }

  static paginated<T>(
    data: T[], 
    page: number, 
    limit: number, 
    total: number,
    message?: string
  ): PaginatedResponse<T> {
    return {
      success: true,
      data,
      message,
      pagination: {
        page,
        limit,
        total,
        hasMore: (page * limit) < total
      },
      timestamp: new Date().toISOString()
    };
  }
}