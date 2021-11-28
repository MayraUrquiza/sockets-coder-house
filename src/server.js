import express from "express";
import handlebars from "express-handlebars";
import { Server as HttpServer } from "http";
import { Server as IOServer } from "socket.io";
import KnexContainer from "./containers/KnexContainer.js";
import MongoDBContainer from "./containers/MongoDBContainer.js";
import routerProductsMock from "./router/productMockRouter.js";
import routerProducts from "./router/productrouter.js";
import mariaDBOptions from "./utils/mariaDB.js";
import MessageSchema from "./schemas/message.js";
import mongoose from "mongoose";
import {
  normalizeMessages,
} from "./utils/messagesNormalizer.js";

mongoose.connect("mongodb://localhost:27017/ecommerce", {
  serverSelectionTimeoutMS: 5000,
});
console.log("Base de datos mongoDB conectada");

const PORT = process.env.PORT || 8080;
const productsContainer = new KnexContainer("products", mariaDBOptions);
const messagesContainer = new MongoDBContainer("mensajes", MessageSchema);

const app = express();

const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

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

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.engine(
  "hbs",
  handlebars({
    extname: "hbs",
    defaultLayout: "index.hbs",
  })
);

app.set("view engine", "hbs");

app.get("/", (req, res) => {
  res.render("main", {});
});

app.use("/api/productos", routerProducts);
app.use("/api/productos-test", routerProductsMock);

const server = httpServer.listen(PORT, () =>
  console.log(`Listen on ${server.address().port}`)
);
server.on("error", (error) => console.log(`Error en el servidor ${error}`));
