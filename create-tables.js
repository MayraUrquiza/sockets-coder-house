const createTableProducts = async () => {
  const mariaDBOptions = require("./src/utils/mariaDB");
  const mariaDBConnection = require("knex")(mariaDBOptions);

  mariaDBConnection.schema
    .createTable("products", (table) => {
      table.increments("id");
      table.string("title");
      table.float("price");
      table.string("thumbnail");
    })
    .then(() => console.log("Tabla products creada"))
    .catch((error) => console.log("Error al crear la tabla products.", error))
    .finally(() => mariaDBConnection.destroy());
};

const createTableMessages = async () => {
  const sqlite3Options = require("./src/utils/sqlite3");
  const sqlite3Connection = require("knex")(sqlite3Options);
  sqlite3Connection.schema
    .createTable("messages", (table) => {
      table.increments("id");
      table.string("email");
      table.float("message");
      table.string("date");
    })
    .then(() => console.log("Tabla messages creada"))
    .catch((error) => console.log("Error al crear la tabla messages.", error))
    .finally(() => sqlite3Connection.destroy());
};

const createTables = async () => {
  await createTableProducts();
  await createTableMessages();
};

createTables();