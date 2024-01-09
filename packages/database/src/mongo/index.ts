import mongoose from "mongoose"
import { createWorkerModel } from "./models"

export const createMongoClient = (connectionString: string) => {
  mongoose.connect(connectionString)

  return {
    worker: createWorkerModel(),
  }
}
