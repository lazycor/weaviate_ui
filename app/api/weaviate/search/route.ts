import { NextRequest, NextResponse } from 'next/server';
import weaviate, { ApiKey } from 'weaviate-ts-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, apiKey, className, searchText, filters, limit = 100 } = body;

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

    let objects: any[];

    if (searchText && searchText.trim() !== '') {
      // Get property names for the GraphQL query fields
      const classSchema = await client.schema.classGetter().withClassName(className).do();
      const propNames = classSchema.properties?.map((p: any) => p.name).join(' ') ?? '';

      const result = await client.graphql
        .get()
        .withClassName(className)
        .withNearText({ concepts: [searchText] })
        .withLimit(limit)
        .withFields(`_additional { id vector } ${propNames}`)
        .do();

      const raw: any[] = result?.data?.Get?.[className] ?? [];
      objects = raw.map((obj) => {
        const { _additional, ...properties } = obj;
        return {
          id: _additional?.id,
          properties,
          vector: _additional?.vector,
        };
      });
    } else {
      const result = await client.data
        .getter()
        .withClassName(className)
        .withLimit(limit)
        .do();

      objects = (result.objects ?? []).map((obj: any) => ({
        id: obj.id,
        properties: obj.properties,
        vector: obj.vector,
      }));
    }

    if (filters && Array.isArray(filters) && filters.length > 0) {
      objects = applyFilters(objects, filters);
    }

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

function applyFilters(objects: any[], filters: any[]) {
  if (!filters || filters.length === 0) return objects;

  return objects.filter((obj) =>
    filters.every((filter) => {
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
    })
  );
}
