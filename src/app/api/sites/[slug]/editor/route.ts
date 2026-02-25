import { NextRequest, NextResponse } from 'next/server';
import { getSiteForEditor } from '@/actions/sites';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const result = await getSiteForEditor(slug);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error === "Site not found or access denied" ? 404 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      site: result.site,
      business: result.business
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
