import 'dotenv/config';
import { defineConfig } from '@prisma/config';

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error(' DATABASE_URL ან DIRECT_URL არ არის მითითებული .env ფაილში!');
}

export default defineConfig({
  datasource: {
    url: dbUrl,
  },
});