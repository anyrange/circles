import { Schema, model } from "mongoose"

type WorkerSchema = {
  host: string
  port: number
  active: boolean
  capacity: number
}

export const createWorkerModel = () => {
  const schema = new Schema<WorkerSchema>({
    host: { type: String, required: true },
    port: { type: Number, required: true },
    capacity: { type: Number, required: true, default: 100 },
    active: { type: Boolean },
  })

  const rawModel = model<WorkerSchema>("worker", schema)

  const list = async (activeOnly = true) => {
    const query = activeOnly ? { active: true } : {}

    return rawModel.find(query).lean().exec()
  }

  return {
    rawModel,
    list,
  }
}
