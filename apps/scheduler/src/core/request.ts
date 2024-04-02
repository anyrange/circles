import fetch, { type RequestInit } from "node-fetch"
import { Job } from "@circles/types"
import { Worker } from "./worker"

export class WorkerRequest {
  endpoint: string

  constructor(worker: Worker) {
    this.endpoint = `http://${worker.host}:${worker.port}`
  }

  private async request(route: string, options?: RequestInit) {
    const defaultHeaders = { "Content-Type": "application/json" }

    return fetch(
      `${this.endpoint}${route}`,
      Object.assign({ headers: defaultHeaders }, options)
    ).then((res) => res.json())
  }

  async status() {
    const res = await this.request("/status")

    return res as {
      load: number
      isFree: boolean
      jobs: number
    }
  }

  async jobs(taskName: string) {
    const res = await this.request(`/jobs?taskName=${taskName}`)

    return res as Job<any>[]
  }

  async exec(
    taskName: string,
    job: Job<any>,
    weight: number,
    priority: number
  ) {
    this.request(`/exec?taskName=${taskName}`, {
      method: "POST",
      body: JSON.stringify({
        ...job,
        weight,
        priority,
      }),
    })

    return true
  }
}
