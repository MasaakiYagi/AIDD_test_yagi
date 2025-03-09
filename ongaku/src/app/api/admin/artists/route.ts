import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const artists = await prisma.artist.findMany({
      include: {
        songs: true,
      },
    });
    return NextResponse.json(artists);
  } catch (error) {
    console.error('Error fetching artists:', error);
    return NextResponse.json(
      { error: 'Error fetching artists' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const artist = await prisma.artist.create({
      data: { name },
    });
    return NextResponse.json(artist, { status: 201 });
  } catch (error) {
    console.error('Error creating artist:', error);
    return NextResponse.json(
      { error: 'Error creating artist' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name } = await request.json();
    if (!id || !name) {
      return NextResponse.json(
        { error: 'ID and name are required' },
        { status: 400 }
      );
    }

    const artist = await prisma.artist.update({
      where: { id },
      data: { name },
    });
    return NextResponse.json(artist);
  } catch (error) {
    console.error('Error updating artist:', error);
    return NextResponse.json(
      { error: 'Error updating artist' },
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

    await prisma.artist.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting artist:', error);
    return NextResponse.json(
      { error: 'Error deleting artist' },
      { status: 500 }
    );
  }
} 