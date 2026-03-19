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
