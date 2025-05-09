import { QueryClient } from "@tanstack/react-query";

// Default fetcher for API requests
async function defaultFetcher<T>(url: string): Promise<T> {
  // تعديل المسارات لاستخدام /server/api بدلا من /api
  let apiUrl = url;
  if (url.startsWith('/api/')) {
    apiUrl = `/server${url}`;
    console.log(`Modified API route from ${url} to ${apiUrl}`);
  } else if (!url.startsWith('/server/api/') && !url.startsWith('http')) {
    apiUrl = `/server/api${url.startsWith('/') ? '' : '/'}${url}`;
    console.log(`Modified API route from ${url} to ${apiUrl}`);
  }
  
  const response = await fetch(apiUrl);
  
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status} for URL ${apiUrl}`);
  }
  
  return response.json();
}

// Helper for API requests with custom options
interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: any;
  headers?: HeadersInit;
}

export async function apiRequest<T>(
  url: string, 
  options: ApiRequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;
  
  // تعديل المسارات لاستخدام /server/api بدلا من /api
  let apiUrl = url;
  if (url.startsWith('/api/')) {
    apiUrl = `/server${url}`;
    console.log(`Modified API route from ${url} to ${apiUrl}`);
  } else if (!url.startsWith('/server/api/') && !url.startsWith('http')) {
    apiUrl = `/server/api${url.startsWith('/') ? '' : '/'}${url}`;
    console.log(`Modified API route from ${url} to ${apiUrl}`);
  }
  
  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    credentials: "include",
  };
  
  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }
  
  const response = await fetch(apiUrl, config);
  
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status} for URL ${apiUrl}`);
  }
  
  return response.json();
}

// Configure the global query client with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000, // 1 minute
      queryFn: ({ queryKey }) => {
        const [url] = queryKey as [string, ...unknown[]];
        return defaultFetcher(url);
      },
    },
  },
});