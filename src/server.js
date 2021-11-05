const express = require("express");
const handlebars = require("express-handlebars");
const { Server: HttpServer } = require("http");
const { Server: IOServer } = require("socket.io");
const { routerProducts } = require("./router/productRouter");
const mariaDBOptions = require("./utils/mariaDB");
const sqlite3Options = require("./utils/sqlite3");

const { container } = require("./containers/KnexContainer.js");

const PORT = process.env.PORT || 8080;
const productsContainer = container("products", mariaDBOptions);
const messagesContainer = container("messages", sqlite3Options);

const app = express();

const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

io.on("connection", async (socket) => {
  console.log("Nuevo cliente conectado");

  socket.emit("refreshProducts", await productsContainer.getAll());
  socket.emit("refreshMessages", await messagesContainer.getAll());

  socket.on("addProduct", async (producto) => {
    await productsContainer.save(producto);
    io.sockets.emit("refreshProducts", await productsContainer.getAll());
  });

  socket.on("addMessage", async (mensaje) => {
    await messagesContainer.save(mensaje);
    io.sockets.emit("refreshMessages", await messagesContainer.getAll());
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

const server = httpServer.listen(PORT, () =>
  console.log(`Listen on ${server.address().port}`)
);
server.on("error", (error) => console.log(`Error en el servidor ${error}`));
