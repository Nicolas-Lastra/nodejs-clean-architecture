import { randomUUID } from 'node:crypto'

export class IdGenerator {
  async generate () {
    const id = randomUUID()
    return id
  }
}
