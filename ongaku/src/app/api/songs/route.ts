import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    let songs;
    if (query) {
      const searchQuery = query.toLowerCase();
      songs = await prisma.song.findMany({
        where: {
          OR: [
            {
              title: {
                contains: searchQuery,
              },
            },
            {
              artist: {
                name: {
                  contains: searchQuery,
                },
              },
            },
          ],
        },
        include: {
          artist: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } else {
      songs = await prisma.song.findMany({
        include: {
          artist: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    }

    return NextResponse.json(songs);
  } catch (error) {
    console.error('Error fetching songs:', error);
    return NextResponse.json(
      { error: 'Error fetching songs' },
      { status: 500 }
    );
  }
} 