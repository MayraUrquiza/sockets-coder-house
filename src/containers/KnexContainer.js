const knex = require("knex");

class KnexContainer {
  constructor(tableName, options) {
    this.connection = knex(options);
    this.table = tableName;
  }

  async save(entry) {
    try {
      const id = await this.connection(this.table).insert(entry);
      return id[0];
    } catch (error) {
      console.log("ERROR:", error);
    }
  }

  async update(entry, id) {
    try {
      await this.connection(this.table).where("id", id).update(entry);
    } catch (error) {
      console.log("ERROR:", error);
    }
  }

  async getById(id) {
    try {
      return await this.connection(this.table).select("*").where("id", id);
    } catch (error) {
      console.log("ERROR:", error);
    }
  }

  async getAll() {
    try {
      return await this.connection(this.table).select("*");
    } catch (error) {
      return [];
    }
  }

  async deleteById(id) {
    try {
      await this.connection(this.table).where("id", id).del();
    } catch (error) {
      console.log("ERROR:", error);
    }
  }

  async deleteAll() {
    try {
      await this.connection(this.table).del();
    } catch (error) {
      console.log("ERROR:", error);
    }
  }
}

exports.container = (tableName, options) =>
  new KnexContainer(tableName, options);
