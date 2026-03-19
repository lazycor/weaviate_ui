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

    const schema = await client.schema.getter().do();
    const classNames = schema.classes?.map((c) => c.class!) ?? [];

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
