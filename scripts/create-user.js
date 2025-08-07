// scripts/create-user.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createUser(name, email, password, role = 'user') {
  try {
    // Usuń jeśli istnieje
    await prisma.user.deleteMany({
      where: { email },
    });
    
    // Utwórz nowego użytkownika z plaintext hasłem
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password, // Bez hashowania!
        role,
      },
    });
    
    console.log(`Utworzono użytkownika: ${user.email} z rolą: ${user.role} i hasłem: ${password}`);
    return user;
  } catch (error) {
    console.error('Błąd podczas tworzenia użytkownika:', error);
  }
}

async function main() {
  // Użytkownicy dla DoradcaAI z prostymi hasłami
  await createUser('Administrator', 'admin@doradcaai.pl', 'admin123', 'admin');
  await createUser('Użytkownik Testowy', 'user@doradcaai.pl', 'test123', 'user');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });