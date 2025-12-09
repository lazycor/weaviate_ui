import { NextRequest, NextResponse } from 'next/server';
import weaviate, { WeaviateClient, ApiKey } from 'weaviate-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, apiKey } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'Weaviate URL is required' },
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

    // Test connection by checking if Weaviate is ready
    const isReady = await client.isReady();

    if (isReady) {
      await client.close();
      return NextResponse.json({
        success: true,
        message: 'Successfully connected to Weaviate'
      });
    } else {
      await client.close();
      return NextResponse.json(
        { error: 'Weaviate is not ready' },
        { status: 503 }
      );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to connect to Weaviate', details: errorMessage },
      { status: 500 }
    );
  }
}
