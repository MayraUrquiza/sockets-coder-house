const fs = require("fs")
const { join } = require("path")
const { default: logger } = require("../../utils/logger")
const FILE_PATH = "data/"

class Container {
  constructor(name) {
    this.name = join(process.cwd(), FILE_PATH.concat(name))
  }

  persist(array = []) {
    const fileContent = JSON.stringify(array, null, 2)
    return fs.promises.writeFile(this.name, fileContent)
  }

  async save(entry) {
    try {
      const content = await this.getAll()
      const id = content.length ? content[content.length - 1].id + 1 : 1
      content.push({ ...entry, id })
      await this.persist(content)
      return id
    } catch (error) {
      logger.error("ERROR:", error)
    }
  }

  async update(entry) {
    try {
      const content = await this.getAll()
      content.push(entry)
      await this.persist(content)
    } catch (error) {
      logger.error("ERROR:", error)
    }
  }

  async getById(id) {
    try {
      const content = await this.getAll()
      return content.find((entry) => entry.id === id)
    } catch (error) {
      logger.error("ERROR:", error)
    }
  }

  async getAll() {
    try {
      const fileContent = await fs.promises.readFile(this.name)
      return JSON.parse(fileContent)
    } catch (error) {
      return []
    }
  }

  async deleteById(id) {
    try {
      const content = await this.getAll()
      const filteredContent = content.filter((entry) => entry.id !== id)
      await this.persist(filteredContent)
    } catch (error) {
      logger.error("ERROR:", error)
    }
  }

  async deleteAll() {
    try {
      await this.persist([])
    } catch (error) {
      logger.error("ERROR:", error)
    }
  }
}

exports.container = (fileName) => new Container(fileName)
