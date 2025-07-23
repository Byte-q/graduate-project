/**
 * وحدة مساعدة للاتصال مع خادم Express API
 * تستخدم هذه الوحدة لتوحيد جميع طلبات API والتأكد من توجيهها إلى خادم Express
 */

import { debug } from './utils'; // Assuming './utils' exists and provides a debug function

// الإعدادات الافتراضية
// - على الخادم: استخدم متغير البيئة API_BASE_URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function buildUrl(endpoint: string, params?: Record<string, any>) {
  let url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  if (params && Object.keys(params).length > 0) {
    const query = new URLSearchParams(params).toString();
    url += `?${query}`;
  }
  return url;
}

async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}, params?: Record<string, any>): Promise<T> {
  const url = buildUrl(endpoint, params);
  
  // --- DEBUGGING LOG ---
  // This log will appear in your server's console (where Next.js is running)
  console.log('apiFetch: Attempting to fetch from URL:', url);
  // --- END DEBUGGING LOG ---

  const response = await fetch(url, options);

  // --- DEBUGGING LOG ---
  console.log('apiFetch: Received response.ok:', response.ok);
  console.log('apiFetch: Received response.status:', response.status);
  console.log('apiFetch: Received response.statusText:', response.statusText);
  // --- END DEBUGGING LOG ---

  if (!response.ok) {
    // --- DEBUGGING LOG ---
    console.error('apiFetch: Response not OK. Full response object:', response);
    // --- END DEBUGGING LOG ---

    let errorMessage = `API error: ${response.status} ${response.statusText}`;
    try {
      // Attempt to parse JSON error message from the response body
      const errorData = await response.json();
      if (errorData?.message) errorMessage = errorData.message;
    } catch (jsonParseError) {
      // If JSON parsing fails, try to get the raw text error message
      // --- DEBUGGING LOG ---
      console.error('apiFetch: Failed to parse error response as JSON, trying as text:', jsonParseError);
      // --- END DEBUGGING LOG ---
      try {
        const errorText = await response.text();
        if (errorText) errorMessage = errorText;
      } catch (textParseError) {
        // --- DEBUGGING LOG ---
        console.error('apiFetch: Failed to parse error response as text:', textParseError);
        // --- END DEBUGGING LOG ---
      }
    }
    throw new Error(errorMessage);
  }
  
  // If response.ok is true, try to parse the successful response
  try {
    return await response.json();
  } catch (jsonError) {
    // This catch block handles cases where the successful response is not valid JSON
    // --- DEBUGGING LOG ---
    console.error('apiFetch: Error parsing successful response as JSON, attempting to read as text:', jsonError);
    // --- END DEBUGGING LOG ---
    return (await response.text()) as any; // Fallback to text if JSON parsing fails
  }
}

export function apiGet<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
  return apiFetch<T>(endpoint, { method: 'GET', credentials: 'include' }, params);
}

export function apiPost<T = any>(endpoint: string, data?: any, params?: Record<string, any>): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: data ? JSON.stringify(data) : undefined,
  }, params);
}

export function apiPut<T = any>(endpoint: string, data?: any, params?: Record<string, any>): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: data ? JSON.stringify(data) : undefined,
  }, params);
}

export function apiDelete<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
  return apiFetch<T>(endpoint, { method: 'DELETE', credentials: 'include' }, params);
}