import { Response } from 'express';

/**
 * HTTP Status Code Enums
 */
export enum HttpStatus {
  // 2xx Success
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  
  // 4xx Client Errors
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  
  // 5xx Server Errors
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503
}

/**
 * Response Status Enums
 */
export enum ResponseStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

/**
 * Error Message Constants
 */
export enum ErrorMessages {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR'
}

/**
 * Standard API Response Interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  errors?: string[];
}

/**
 * API Helper Functions
 */
export class ApiHelper {
  /**
   * Send a success response
   * 
   * @param res - Express response object
   * @param message - Success message
   * @param data - Response data
   * @returns void
   */
  static success<T>(
    res: Response,
    message: string,
    data: T | null = null
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data
    };
    
    res.status(HttpStatus.OK).json(response);
  }
  
  /**
   * Send an error response
   * 
   * @param res - Express response object
   * @param message - Error message
   * @param statusCode - HTTP status code (default: 500 Internal Server Error)
   * @param errors - Array of specific error messages (optional)
   * @param data - Additional error data (optional)
   * @returns void
   */
  static error<T>(
    res: Response,
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    errors: string[] = [],
    data: T | null = null
  ): void {
    const response: ApiResponse<T> = {
      success: false,
      message,
      data,
      errors: errors.length > 0 ? errors : undefined
    };
    
    res.status(statusCode).json(response);
  }
  
  /**
   * Send a not found response
   * 
   * @param res - Express response object
   * @returns void
   */
  static notFound(
    res: Response
  ): void {
    this.error(res, ErrorMessages.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND);
  }
  
  /**
   * Send an unauthorized response
   * 
   * @param res - Express response object
   * @returns void
   */
  static unauthorized(
    res: Response
  ): void {
    this.error(res, ErrorMessages.UNAUTHORIZED_ACCESS, HttpStatus.UNAUTHORIZED);
  }
  
  /**
   * Send a validation error response
   * 
   * @param res - Express response object
   * @param errors - Validation errors array
   * @returns void
   */
  static validationError(
    res: Response,
    errors: string[] = []
  ): void {
    this.error(res, ErrorMessages.VALIDATION_ERROR, HttpStatus.UNPROCESSABLE_ENTITY, errors);
  }
  
  /**
   * Send a conflict response
   * 
   * @param res - Express response object
   * @returns void
   */
  static conflict(
    res: Response
  ): void {
    this.error(res, ErrorMessages.CONFLICT_ERROR, HttpStatus.CONFLICT);
  }
  
  /**
   * Send a created response
   * 
   * @param res - Express response object
   * @param message - Created message
   * @param data - Created resource data
   * @returns void
   */
  static created<T>(
    res: Response,
    message: string,
    data: T
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data
    };
    
    res.status(HttpStatus.CREATED).json(response);
  }
}