type ListNode<T> = {
  next: ListNode<T> | null
  prev: ListNode<T> | null
  key: string
  value: T
}

export class UniqQueue<T> {
  private head: ListNode<T> | null
  private tail: ListNode<T> | null
  private map: Map<string, ListNode<T>>

  constructor() {
    this.head = null
    this.tail = null
    this.map = new Map()
  }

  static createNode<T>(key: string, value: T): ListNode<T> {
    return {
      next: null,
      prev: null,
      key,
      value,
    }
  }

  has(key: string) {
    return this.map.has(key)
  }

  push(key: string, value: T) {
    if (this.has(key)) return false

    const node = UniqQueue.createNode<T>(key, value)
    this.map.set(key, node)

    node.prev = this.tail
    if (this.tail !== null) {
      this.tail.next = node
    }
    this.tail = node
    if (this.head === null) {
      this.head = node
    }

    return true
  }

  pushFront(key: string, value: T) {
    if (this.has(key)) return false

    const node = UniqQueue.createNode<T>(key, value)
    this.map.set(key, node)

    node.next = this.head
    if (this.head !== null) {
      this.head.prev = node
    }
    this.head = node
    if (this.tail === null) {
      this.tail = node
    }

    return true
  }

  delete(key: string) {
    if (!this.has(key)) return false

    const node = this.map.get(key)!

    if (node.prev !== null) {
      node.prev.next = node.next
    } else {
      this.head = node.next
    }

    if (node.next) {
      node.next.prev = node.prev
    } else {
      this.tail = node.prev
    }

    this.map.delete(key)

    return true
  }

  pop() {
    if (this.head === null) return null
    this.map.delete(this.head.key)

    const curHead = this.head
    const nextHead = this.head.next

    if (this.head.next !== null) {
      this.head.next.prev = null
      this.head.next = null
    } else {
      this.tail = null
    }
    this.head = nextHead

    return curHead.value
  }

  front() {
    if (this.head === null) return null
    return this.head.value
  }

  back() {
    if (this.tail === null) return null
    return this.tail.value
  }

  size() {
    return this.map.size
  }

  clear() {
    this.map.clear()
  }
}
