import { prisma } from "./lib/prisma";
import fs from "fs/promises";
import path from "path";

async function test() {
  try {
    const uploadDir = path.join(process.cwd(), "public", "avatars");
    await fs.mkdir(uploadDir, { recursive: true });
    console.log("mkdir success", uploadDir);
  } catch (e) {
    console.error("error", e);
  }
}
test();
