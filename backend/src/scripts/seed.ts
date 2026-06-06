import { defaultStorePath, writeSeedFile } from "../data/store";

const filePath = defaultStorePath();
writeSeedFile(filePath);
console.log(`Seed data written to ${filePath}`);
