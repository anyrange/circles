import { Schema, model } from "mongoose"

type TaskSchema = {
  name: string
  weight: number
  priority: number
  minExecutionInterval: number
  active: boolean
}

export const createTaskModel = () => {
  const schema = new Schema<TaskSchema>({
    name: { type: String, required: true },
    weight: { type: Number, required: true, default: 100 },
    priority: { type: Number, default: 0 },
    minExecutionInterval: { type: Number, required: true },
    active: { type: Boolean },
  })

  const rawModel = model<TaskSchema>("task", schema)

  const list = async (activeOnly = true) => {
    const query = activeOnly ? { active: true } : {}

    return rawModel.find(query).exec()
  }

  return {
    rawModel,
    list,
  }
}
