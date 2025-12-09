import { NextRequest, NextResponse } from 'next/server';
import weaviate, { WeaviateClient, ApiKey } from 'weaviate-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      url,
      apiKey,
      className,
      searchText,
      filters,
      limit = 100
    } = body;

    if (!url || !className) {
      return NextResponse.json(
        { error: 'URL and className are required' },
        { status: 400 }
      );
    }

    // Create Weaviate client
    let client: WeaviateClient;

    if (apiKey) {
      client = await weaviate.connectToCustom({
        httpHost: url.replace(/^https?:\/\//, ''),
        httpPort: url.startsWith('https') ? 443 : 80,
        httpSecure: url.startsWith('https'),
        authCredentials: new ApiKey(apiKey),
      });
    } else {
      client = await weaviate.connectToCustom({
        httpHost: url.replace(/^https?:\/\//, ''),
        httpPort: url.startsWith('https') ? 443 : 80,
        httpSecure: url.startsWith('https'),
      });
    }

    const collection = client.collections.get(className);

    let result;

    // If search text is provided, use nearText search
    if (searchText && searchText.trim() !== '') {
      result = await collection.query.nearText(searchText, {
        limit,
      });
    }
    // Otherwise, fetch all objects
    else {
      result = await collection.query.fetchObjects({
        limit,
      });
    }

    // Format the response
    let objects = result.objects.map((obj: any) => ({
      id: obj.uuid,
      properties: obj.properties,
      vector: obj.vectors?.default,
    }));

    // Apply client-side filters if provided
    if (filters && Array.isArray(filters) && filters.length > 0) {
      objects = applyFilters(objects, filters);
    }

    await client.close();

    return NextResponse.json({
      success: true,
      objects,
      total: objects.length,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to search objects', details: errorMessage },
      { status: 500 }
    );
  }
}

// Apply client-side filters to results
function applyFilters(objects: any[], filters: any[]) {
  if (!filters || filters.length === 0) return objects;

  return objects.filter(obj => {
    return filters.every(filter => {
      const value = obj.properties[filter.key];
      const filterValue = filter.value;

      switch (filter.operator) {
        case 'Equal':
          return String(value).toLowerCase() === String(filterValue).toLowerCase();
        case 'NotEqual':
          return String(value).toLowerCase() !== String(filterValue).toLowerCase();
        case 'GreaterThan':
          return Number(value) > Number(filterValue);
        case 'GreaterThanEqual':
          return Number(value) >= Number(filterValue);
        case 'LessThan':
          return Number(value) < Number(filterValue);
        case 'LessThanEqual':
          return Number(value) <= Number(filterValue);
        case 'Like':
          return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
        default:
          return true;
      }
    });
  });
}
