

  import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

 const dishes = [
    { name: "ხინკალი (ქალაქური)", price: 1.50 },
    { name: "მწვადი (ღორის)", price: 15.00 },
    { name: "ხაჭაპური (იმერული)", price: 12.00 },
    { name: "ხაჭაპური (მეგრული)", price: 14.00 },
    { name: "ოსტრი", price: 10.00 },
    { name: "შქმერული", price: 20.00 },
    { name: "ქაბაბი", price: 11.00 },
    { name: "ფხალის დაფა", price: 18.00 },
    { name: "ბადრიჯანი ნიგვზით", price: 9.00 },
    { name: "სოკო კეცზე", price: 10.00 },
    { name: "კიტრი-პომიდვრის სალათი", price: 8.00 },
    { name: "ცეზარი", price: 16.00 },
    { name: "პიცა მარგარიტა", price: 15.00 },
    { name: "კარტოფილი ფრი", price: 5.00 },
    { name: "ლიმონათი (ტარხუნა)", price: 3.00 }
  ];

  for (const dish of dishes) {
    await prisma.dish.create({
      data: dish,
    });
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });