import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url, phone, msg } = await req.json();

    if (!url || !phone || !msg) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Properly encode the parameters just as expected by MacroDroid
    // If the base URL accidentally includes query params, we safely append
    const baseUrl = url.includes('?') ? url.substring(0, url.indexOf('?')) : url;
    const requestUrl = `${baseUrl}?phone=${encodeURIComponent(phone)}&msg=${encodeURIComponent(msg)}`;

    const response = await fetch(requestUrl, {
      method: 'GET',
    });

    const text = await response.text();

    return NextResponse.json({ success: true, response: text });
  } catch (error: any) {
    console.error('Server side fetch error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
