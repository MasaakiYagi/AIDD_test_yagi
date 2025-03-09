import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const songs = await prisma.song.findMany({
      include: {
        artist: true,
      },
    });
    return NextResponse.json(songs);
  } catch (error) {
    console.error('Error fetching songs:', error);
    return NextResponse.json(
      { error: 'Error fetching songs' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { title, url, artistId } = await request.json();
    if (!title || !url || !artistId) {
      return NextResponse.json(
        { error: 'Title, URL, and artist ID are required' },
        { status: 400 }
      );
    }

    const song = await prisma.song.create({
      data: {
        title,
        url,
        artistId,
      },
      include: {
        artist: true,
      },
    });
    return NextResponse.json(song, { status: 201 });
  } catch (error) {
    console.error('Error creating song:', error);
    return NextResponse.json(
      { error: 'Error creating song' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, title, url, artistId } = await request.json();
    if (!id || !title || !url || !artistId) {
      return NextResponse.json(
        { error: 'ID, title, URL, and artist ID are required' },
        { status: 400 }
      );
    }

    const song = await prisma.song.update({
      where: { id },
      data: {
        title,
        url,
        artistId,
      },
      include: {
        artist: true,
      },
    });
    return NextResponse.json(song);
  } catch (error) {
    console.error('Error updating song:', error);
    return NextResponse.json(
      { error: 'Error updating song' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    await prisma.song.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting song:', error);
    return NextResponse.json(
      { error: 'Error deleting song' },
      { status: 500 }
    );
  }
} 