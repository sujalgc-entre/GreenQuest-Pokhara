import { NextResponse } from 'next/server';

export async function GET() {
  const API_KEY = process.env.OPENWEATHER_API_KEY;
  const LAT = '28.2096';
  const LON = '83.9856';

  if (!API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric`
    );
    
    if (!weatherRes.ok) {
      throw new Error('Weather API failed');
    }

    const data = await weatherRes.json();
    return NextResponse.json(data);
    } catch (error: unknown) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
