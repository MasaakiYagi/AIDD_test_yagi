import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// スコアの取得（上位3件）
export async function GET() {
  try {
    const scores = await prisma.gameScore.findMany({
      take: 3,
      orderBy: {
        score: 'desc',
      },
    });
    return NextResponse.json(scores);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 });
  }
}

// 新しいスコアの登録
export async function POST(request: Request) {
  try {
    const { username, score } = await request.json();
    const newScore = await prisma.gameScore.create({
      data: {
        username,
        score,
      },
    });
    return NextResponse.json(newScore);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create score' }, { status: 500 });
  }
} 