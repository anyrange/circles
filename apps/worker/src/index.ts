import "@total-typescript/ts-reset"
import express from "express"
import { log } from "@circles/utils"
import { PORT } from "./config"
import { WorkerManager } from "./core/manager"
import { activeTasks } from "./tasks"

const manager = new WorkerManager()

for (const task of activeTasks) {
  manager.registerTask(task)
}

const app = express()

app.use(express.json())

app.get("/ping", async (_, res) => {
  res.send("pong\n")
})

app.get("/status", async (_, res) => {
  res.json(manager.status)
})

app.get("/tasks", async (_, res) => {
  res.json([...manager.tasks.keys()])
})

app.get("/jobs", async (req, res) => {
  const { taskName } = req.query

  if (
    !taskName ||
    typeof taskName != "string" ||
    !manager.tasks.get(taskName)
  ) {
    res.status(404)
    res.send("Not found")
    return
  }

  const handler = manager.tasks.get(taskName)!

  res.json(await handler.create())
})

app.post("/exec", async (req, res) => {
  const { taskName } = req.query
  const { jobId, args } = req.body

  if (
    !taskName ||
    typeof taskName != "string" ||
    !manager.tasks.get(taskName)
  ) {
    res.status(404)
    res.send("Not found")
    return
  }

  if (!jobId || !args) {
    res.status(400)
    res.send("Job not provided")
    return
  }

  manager.enqueueJob(taskName, { jobId, args })

  res.json({ message: "enqueued" })
})

app.listen(PORT, () => {
  log(`Server running at http://localhost:${PORT}`)
})
