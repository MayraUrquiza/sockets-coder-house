import MessageSchema from "../schemas/message.js";
import MongoDBContainer from "../containers/MongoDBContainer.js";
import logger from "../utils/logger.js";

class MessageApi {
  constructor() {
    this.messagesContainer = new MongoDBContainer("mensajes", MessageSchema);
  }

  getMessages = async () => {
    try {
      return await this.messagesContainer.getAll();
    } catch (error) {
      logger.error("Error al consultar mensajes", error);
    }
  };

  saveMessage = async (message) => {
    try {
      await this.messagesContainer.save(message);
    } catch (error) {
      logger.error("Error al guardar mensaje", error);
    }
  };
}

export default MessageApi;
