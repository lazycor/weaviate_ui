export interface WeaviateConnection {
  url: string;
  apiKey?: string;
}

export interface WeaviateObject {
  id: string;
  properties: Record<string, any>;
  vector?: number[];
}

export interface Filter {
  key: string;
  operator: string;
  value: string;
}
