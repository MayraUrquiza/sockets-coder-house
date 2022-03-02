import KnexContainer from "../persistence/containers/KnexContainer.js";
import mariaDBOptions from "../utils/mariaDB.js";
import MessageSchema from "../models/message.js";
import MongoDBContainer from "../persistence/containers/MongoDBContainer.js";

const container = (model) => {
  if (model === "products")
    return new KnexContainer("products", mariaDBOptions);
  if (model === "mensajes")
    return new MongoDBContainer("mensajes", MessageSchema);
};

export default container;
