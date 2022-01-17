import express from "express";
import handlebars from "express-handlebars";
import { Server as HttpServer } from "http";
import { Server as IOServer } from "socket.io";
import routerProductsMock from "./router/productMockRouter.js";
import routerProducts from "./router/productRouter.js";
import routerInfo from "./router/infoRouter.js";
import routerRandom from "./router/randomRouter.js";
import connectSocket from "./utils/socket.js";
import mongoose from "mongoose";
import session from "express-session";
import { initializePassport, getPassport } from "./utils/passport.js";
import dotenv from 'dotenv';
import yargs from 'yargs';
import cluster from 'cluster'; 

dotenv.config();

const args = yargs(process.argv.slice(2));

const argv = args
  .alias({
    p: "port",
    m: "mode",
  })
  .default({
    port: 8080,
    mode: "FORK",
  }).argv;

const PORT = argv.port;
const MODE = argv.mode;

mongoose.connect(process.env.DATABASE_URI, {
  serverSelectionTimeoutMS: 5000,
});
console.log("Base de datos mongoDB conectada");

const app = express();

app.use(
  session({
    // store: MongoStore.create({mongoUrl: 'mongodb://localhost/sesiones'}),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 10000 * 60 },
  })
);

initializePassport(app);
const passport = getPassport();

const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

connectSocket(io);

app.use(express.json());
// app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.engine(
  "hbs",
  handlebars({
    extname: "hbs",
    defaultLayout: "index.hbs",
  })
);

app.set("view engine", "hbs");

let username = "";

const authenticate = (req, res, next) => {
  if (!req.isAuthenticated()) res.redirect("/logout");
  else next();
};

app.get("/logout", (req, res) => {
  res.render("logout", { username });
});

app.get("/login", (req, res) => {
  res.render("login", {});
});

app.get("/register", (req, res) => {
  res.render("register", {});
});

app.get("/loginerror", (req, res) => {
  res.render("error", {
    message: "Credenciales inválidas. Vuelve a intentarlo",
    redirect: "/login",
  });
});

app.get("/registererror", (req, res) => {
  res.render("error", {
    message: "Ya existe un usuario con el email ingresado",
    redirect: "/register",
  });
});

app.post(
  "/api/login",
  passport.authenticate("login", { failureRedirect: "/loginerror" }),
  (req, res) => {
    req.session.user = req.body.email;
    username = req.body.email;
    res.redirect("/");
  }
);

app.post(
  "/api/register",
  passport.authenticate("register", { failureRedirect: "/registererror" }),
  (req, res) => {
    res.redirect("/login");
  }
);

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
app.use("/", routerInfo);

if (MODE === "CLUSTER" && cluster.isPrimary) {
  const CPUs =  os.cpus().length;

  for (const i = 0; i < CPUs; i++) {
    cluster.fork();    
  }

  cluster.on('exit', (worker) => {
    cluster.fork();
  });
} else {
  app.use("/api/randoms", routerRandom);
}

const server = httpServer.listen(PORT, () => {
  console.log(`Listen on ${server.address().port}`);
  console.log(`Server on mode ${MODE}`);
});
server.on("error", (error) => console.log(`Error en el servidor ${error}`));
