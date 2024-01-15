import "@total-typescript/ts-reset"
import express from "express"
import { log } from "@circles/utils"
import { PORT } from "./config"
import { WorkerManager } from "./core/manager"
import { activeTasks } from "./tasks"

const manager = new WorkerManager()

for (const task of activeTasks) {
  manager.registerTaskHandler(task)
}

const app = express()

app.use(express.json())

app.get("/ping", async (_, res) => {
  res.send("pong\n")
})

app.get("/status", async (_, res) => {
  res.json(manager.status())
})

app.get("/tasks", async (_, res) => {
  res.json(manager.tasksList())
})

app.get("/jobs", async (req, res) => {
  const { taskName } = req.query

  if (
    !taskName ||
    typeof taskName != "string" ||
    !manager.getTaskHandler(taskName)
  ) {
    res.status(404)
    res.send("Not found")
    return
  }

  const handler = manager.getTaskHandler(taskName)!

  res.json(await handler.create())
})

app.post("/exec", async (req, res) => {
  const { taskName } = req.query
  const { jobId, weight, args, priority = 0 } = req.body

  if (
    !taskName ||
    typeof taskName != "string" ||
    !manager.getTaskHandler(taskName)
  ) {
    res.status(404)
    res.send("Not found")
    return
  }

  if (!jobId || !weight || !args) {
    res.status(400)
    res.send("Job not provided")
    return
  }

  if (
    typeof jobId !== "string" ||
    typeof weight !== "number" ||
    typeof priority !== "number"
  ) {
    res.status(400)
    res.send("Invalid job properties")
    return
  }

  try {
    await manager.enqueueJob(taskName, weight, { jobId, args }, priority)
  } catch (e) {
    res.status(400).json({ message: (e as Error).message })
    return
  }

  res.json({ message: "enqueued" })
})

app.listen(PORT, () => {
  log(`Server running at http://localhost:${PORT}`)
})
