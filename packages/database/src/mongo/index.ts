import mongoose from "mongoose"
import { createWorkerModel, createTaskModel } from "./models"

export const createMongoClient = async (connectionString: string) => {
  await mongoose.connect(connectionString)
  console.log("a")
  return {
    worker: createWorkerModel(),
    task: createTaskModel(),
  }
}
