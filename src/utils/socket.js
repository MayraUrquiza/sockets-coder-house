import {
  normalizeMessages,
} from "./messagesNormalizer.js";
import MessageApi from "../apis/message.js";
import ProductApi from "../apis/product.js";
import logger from "./logger.js";

const productsApi = new ProductApi();
const messagesApi = new MessageApi();

const connectSocket = (io) => {
  io.on("connection", async (socket) => {
    logger.info("Nuevo cliente conectado");

    const messages = await messagesApi.getMessages();
    const { normalizedMessages, compression } = normalizeMessages(
      messages.map((message) => ({ ...message, id: message._id.toString() }))
    );

    socket.emit("refreshProducts", await productsApi.getProducts());
    socket.emit("refreshMessages", normalizedMessages, compression);

    socket.on("addProduct", async (producto) => {
      await productsApi.saveProduct(producto);
      io.sockets.emit("refreshProducts", await productsApi.getProducts());
    });

    socket.on("addMessage", async (mensaje) => {
      await messagesApi.saveMessage(mensaje);
      const messages = await messagesApi.getMessages();
      const { normalizedMessages, compression } = normalizeMessages(
        messages.map((message) => ({ ...message, id: message._id.toString() }))
      );

      io.sockets.emit("refreshMessages", normalizedMessages, compression);
    });
  });
};

export default connectSocket;
