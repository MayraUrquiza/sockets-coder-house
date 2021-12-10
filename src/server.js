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
import session from 'express-session';
import MongoStore from 'connect-mongo';

mongoose.connect("mongodb://localhost:27017/ecommerce", {
  serverSelectionTimeoutMS: 5000,
});
console.log("Base de datos mongoDB conectada");

const PORT = process.env.PORT || 8080;
const productsContainer = new KnexContainer("products", mariaDBOptions);
const messagesContainer = new MongoDBContainer("mensajes", MessageSchema);

const app = express();

app.use(session({
  store: MongoStore.create({mongoUrl: 'mongodb://localhost/sesiones'}),
  secret: 'supersecret',
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge: 1000 * 60},
}))

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

let username = '';

const authenticate = (req, res, next) => {
  if (!req.session.user) res.redirect("/logout");
  else next();
};

app.get("/logout", (req, res) => {
  res.render("logout", {username});
});

app.get("/login", (req, res) => {
  res.render("login", {});
});

app.post("/api/login", (req, res) => {
  req.session.user = req.body.name;
  username = req.body.name;
  res.redirect("/");
});

app.post("/api/logout", authenticate, (req, res) => {
  req.session.destroy((err) => {
    if (!err) res.redirect("/logout");
    else res.send({ status: "Logout ERROR", body: err });
  });
});

app.get("/", authenticate, (req, res) => {
  res.render("main", {});
});

app.get("/api/user-info", authenticate, (req, res) => {
  res.status(200).json(req.session.user);
});

app.use("/api/productos", authenticate, routerProducts);
app.use("/api/productos-test", authenticate, routerProductsMock);

const server = httpServer.listen(PORT, () =>
  console.log(`Listen on ${server.address().port}`)
);
server.on("error", (error) => console.log(`Error en el servidor ${error}`));
