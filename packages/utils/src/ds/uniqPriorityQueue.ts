import { UniqQueue } from "./uniqQueue"

export class UniqPriorityQueue<T> {
  private queues: { [key: number]: UniqQueue<T> }

  constructor() {
    this.queues = {}
  }

  enqueue(key: string, value: T, priority: number) {
    if (!this.queues[priority]) {
      this.queues[priority] = new UniqQueue<T>()
    }

    const queue = this.queues[priority]

    return queue.push(key, value)
  }

  dequeue() {
    const priorities = Object.keys(this.queues)
      .map((key) => Number(key))
      .sort((a, b) => a - b)

    if (!priorities.length) return null

    const highestPriority = priorities[0]

    const queue = this.queues[highestPriority]

    const value = queue.pop()

    if (queue.size() === 0) delete this.queues[highestPriority]

    return value
  }

  size() {
    return Object.values(this.queues).reduce((acc, cur) => acc + cur.size(), 0)
  }

  clear() {
    Object.values(this.queues).forEach((q) => q.clear())
    this.queues = {}
  }
}
