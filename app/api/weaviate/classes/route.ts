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

    // Get all collections/classes
    const collections = await client.collections.listAll();
    const classNames = Object.keys(collections);

    await client.close();

    return NextResponse.json({
      success: true,
      classes: classNames
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to fetch classes', details: errorMessage },
      { status: 500 }
    );
  }
}
