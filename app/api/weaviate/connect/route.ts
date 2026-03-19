import { NextRequest, NextResponse } from 'next/server';
import weaviate, { ApiKey } from 'weaviate-ts-client';

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

    const parsed = new URL(url);
    const scheme = parsed.protocol === 'https:' ? 'https' : 'http';
    const host = parsed.port ? `${parsed.hostname}:${parsed.port}` : parsed.hostname;

    const client = weaviate.client({
      scheme,
      host,
      ...(apiKey && { apiKey: new ApiKey(apiKey) }),
    });

    const isReady = await client.misc.readyChecker().do();

    if (isReady) {
      return NextResponse.json({
        success: true,
        message: 'Successfully connected to Weaviate'
      });
    } else {
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
