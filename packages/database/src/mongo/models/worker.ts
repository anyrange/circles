import { Schema, model } from "mongoose"

type WorkerSchema = {
  url: string
  active: boolean
  capacity: number
}

export const createWorkerModel = () => {
  const schema = new Schema<WorkerSchema>({
    url: { type: String, required: true },
    capacity: { type: Number, required: true, default: 100 },
    active: { type: Boolean },
  })

  const rawModel = model<WorkerSchema>("worker", schema)

  const list = async (activeOnly = true) => {
    const query = activeOnly ? { active: true } : {}

    return rawModel.find(query).exec()
  }

  return {
    rawModel,
    list,
  }
}
