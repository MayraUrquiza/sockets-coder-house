import KnexContainer from "../containers/KnexContainer.js";
import MongoDBContainer from "../containers/MongoDBContainer.js";
import mariaDBOptions from "./mariaDB.js";
import MessageSchema from "../schemas/message.js";
import {
  normalizeMessages,
} from "./messagesNormalizer.js";

const productsContainer = new KnexContainer("products", mariaDBOptions);
const messagesContainer = new MongoDBContainer("mensajes", MessageSchema);

const connectSocket = (io) => {
  io.on("connection", async (socket) => {
    console.log("Nuevo cliente conectado");

    const messages = await messagesContainer.getAll();
    const { normalizedMessages, compression } = normalizeMessages(
      messages.map((message) => ({ ...message, id: message._id.toString() }))
    );

    socket.emit("refreshProducts", await productsContainer.getAll());
    socket.emit("refreshMessages", normalizedMessages, compression);

    socket.on("addProduct", async (producto) => {
      await productsContainer.save(producto);
      io.sockets.emit("refreshProducts", await productsContainer.getAll());
    });

    socket.on("addMessage", async (mensaje) => {
      await messagesContainer.save(mensaje);
      const messages = await messagesContainer.getAll();
      const { normalizedMessages, compression } = normalizeMessages(
        messages.map((message) => ({ ...message, id: message._id.toString() }))
      );

      io.sockets.emit("refreshMessages", normalizedMessages, compression);
    });
  });
};

export default connectSocket;
