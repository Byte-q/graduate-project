declare global {
  var memoryCache: Map<string, { data: any; timestamp: number }>;
}

export {};