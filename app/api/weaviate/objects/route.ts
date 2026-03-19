import { NextRequest, NextResponse } from 'next/server';
import weaviate, { ApiKey } from 'weaviate-ts-client';

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

    const parsed = new URL(url);
    const scheme = parsed.protocol === 'https:' ? 'https' : 'http';
    const host = parsed.port ? `${parsed.hostname}:${parsed.port}` : parsed.hostname;

    const client = weaviate.client({
      scheme,
      host,
      ...(apiKey && { apiKey: new ApiKey(apiKey) }),
    });

    const result = await client.data
      .getter()
      .withClassName(className)
      .withLimit(limit)
      .withOffset(offset)
      .do();

    const objects = (result.objects ?? []).map((obj: any) => ({
      id: obj.id,
      properties: obj.properties,
      vector: obj.vector,
    }));

    return NextResponse.json({
      success: true,
      objects,
      total: objects.length,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to fetch objects', details: errorMessage },
      { status: 500 }
    );
  }
}
