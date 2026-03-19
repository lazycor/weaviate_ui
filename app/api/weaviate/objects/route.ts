import { NextRequest, NextResponse } from 'next/server';
import weaviate, { WeaviateClient, ApiKey } from 'weaviate-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, apiKey, className, limit = 100, offset = 0 } = body;

    if (!url || !className) {
      return NextResponse.json(
        { error: 'URL and className are required' },
        { status: 400 }
      );
    }

    // Create Weaviate client
    const parsed = new URL(url);
    const httpSecure = parsed.protocol === 'https:';
    const httpHost = parsed.hostname;
    const httpPort = parsed.port ? parseInt(parsed.port) : (httpSecure ? 443 : 80);

    let client: WeaviateClient;

    if (apiKey) {
      client = await weaviate.connectToCustom({
        httpHost,
        httpPort,
        httpSecure,
        authCredentials: new ApiKey(apiKey),
      });
    } else {
      client = await weaviate.connectToCustom({
        httpHost,
        httpPort,
        httpSecure,
      });
    }

    // Get collection
    const collection = client.collections.get(className);

    // Fetch objects with pagination
    const result = await collection.query.fetchObjects({
      limit,
      offset,
    });

    // Format the response
    const objects = result.objects.map((obj) => ({
      id: obj.uuid,
      properties: obj.properties,
      vector: obj.vectors?.default,
    }));

    await client.close();

    return NextResponse.json({
      success: true,
      objects,
      total: result.objects.length,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to fetch objects', details: errorMessage },
      { status: 500 }
    );
  }
}
