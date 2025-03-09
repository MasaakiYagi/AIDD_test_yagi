import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // サンプルアーティストの作成
  const artist1 = await prisma.artist.create({
    data: {
      name: 'The Digital Dreams',
      songs: {
        create: [
          {
            title: 'Cyber Sunset',
            url: '/audio/cyber-sunset.wav'
          },
          {
            title: 'Electric Waves',
            url: '/audio/electric-waves.wav'
          }
        ]
      }
    }
  });

  const artist2 = await prisma.artist.create({
    data: {
      name: 'Luna Echo',
      songs: {
        create: [
          {
            title: 'Midnight Serenade',
            url: '/audio/midnight-serenade.wav'
          },
          {
            title: 'Starlight Dance',
            url: '/audio/starlight-dance.wav'
          }
        ]
      }
    }
  });

  const artist3 = await prisma.artist.create({
    data: {
      name: 'Quantum Beats',
      songs: {
        create: [
          {
            title: 'Future Rhythm',
            url: '/audio/future-rhythm.wav'
          },
          {
            title: 'Digital Pulse',
            url: '/audio/digital-pulse.wav'
          }
        ]
      }
    }
  });

  const artist4 = await prisma.artist.create({
    data: {
      name: 'Sonic Wave Collective',
      songs: {
        create: [
          {
            title: 'Ocean of Sound',
            url: '/audio/ocean-of-sound.wav'
          },
          {
            title: 'Harmonic Flow',
            url: '/audio/harmonic-flow.wav'
          }
        ]
      }
    }
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 