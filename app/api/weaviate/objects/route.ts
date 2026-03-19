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

    // Fetch property names for the GraphQL fields list
    const classSchema = await client.schema.classGetter().withClassName(className).do();
    const propNames = classSchema.properties?.map((p: any) => p.name).join(' ') ?? '';

    const result = await client.graphql
      .get()
      .withClassName(className)
      .withLimit(limit)
      .withOffset(offset)
      .withFields(`_additional { id vector } ${propNames}`)
      .do();

    const raw: any[] = result?.data?.Get?.[className] ?? [];
    const objects = raw.map((obj) => {
      const { _additional, ...properties } = obj;
      return {
        id: _additional?.id,
        properties,
        vector: _additional?.vector,
      };
    });

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
