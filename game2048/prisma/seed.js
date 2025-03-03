const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const dummyData = [
    { username: 'Alice', score: 12000 },
    { username: 'Bob', score: 10240 },
    { username: 'Charlie', score: 8192 },
    { username: 'David', score: 6144 },
    { username: 'Eve', score: 4096 },
  ];

  for (const data of dummyData) {
    await prisma.gameScore.create({
      data,
    });
  }

  console.log('Seed data has been inserted');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 