import cron from "node-cron"
import prisma from "@circles/database"

async function main() {
  try {
    console.log(
      await prisma.user.findUnique({
        where: { id: "7uq098pzvp4db2e2138tmgneb" },
      })
    )
    await prisma.$disconnect()
  } catch (e) {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  }
}

main().then()
cron.schedule("* * * * * *", () => {
  console.log("running a task every minute")
})
