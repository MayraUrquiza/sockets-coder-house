const sqlite3Options = {
  client: "sqlite3",
  connection: {
    filename: "./DB/ecommerce.sqlite",
  },
  useNullAsDefault: true,
};

export default sqlite3Options;
