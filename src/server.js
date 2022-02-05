import express from "express";
import handlebars from "express-handlebars";
import { Server as HttpServer } from "http";
import { Server as IOServer } from "socket.io";
import routerProductsMock from "./router/productMockRouter.js";
import routerProducts from "./router/productRouter.js";
import routerInfo from "./router/infoRouter.js";
import routerRandom from "./router/randomRouter.js";
import connectSocket from "./utils/socket.js";
import { initializePassport, getPassport } from "./utils/passport.js";
import logger from "./utils/logger.js";
import mongoose from "mongoose";
import session from "express-session";
import dotenv from 'dotenv';
import yargs from 'yargs';
import cluster from 'cluster'; 
import compression from 'compression'
import MongoStore from "connect-mongo";

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

const PORT = process.env.PORT || argv.port;
const MODE = argv.mode;

mongoose.connect(process.env.DATABASE_URI, {
  serverSelectionTimeoutMS: 5000,
});
console.log("Base de datos mongoDB conectada");

const app = express();

app.use(
  session({
    store: MongoStore.create({mongoUrl: 'mongodb://localhost/sesiones'}),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000000 * 60 },
  })
);

initializePassport(app);
const passport = getPassport();

const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

connectSocket(io);

app.use(compression());
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

let username = "";

const logRequestInfo = (req, res, next) => {
  const { url, method, baseUrl } = req;
  logger.info(`Petición recibida en ${method} ${baseUrl}${url}`);
  next();
};

const authenticate = (req, res, next) => {
  if (!req.isAuthenticated()) res.redirect("/logout");
  else next();
};

app.get("/logout", logRequestInfo, (req, res) => {
  res.render("logout", { username });
});

app.get("/login", logRequestInfo, (req, res) => {
  res.render("login", {});
});

app.get("/register", logRequestInfo, (req, res) => {
  res.render("register", {});
});

app.get("/loginerror", logRequestInfo, (req, res) => {
  res.render("error", {
    message: "Credenciales inválidas. Vuelve a intentarlo",
    redirect: "/login",
  });
});

app.get("/registererror", logRequestInfo, (req, res) => {
  res.render("error", {
    message: "Ya existe un usuario con el email ingresado",
    redirect: "/register",
  });
});

app.post(
  "/api/login",
  passport.authenticate("login", { failureRedirect: "/loginerror" }),
  logRequestInfo, 
  (req, res) => {
    req.session.user = req.body.email;
    username = req.body.email;
    res.redirect("/");
  }
);

app.post(
  "/api/register",
  passport.authenticate("register", { failureRedirect: "/registererror" }),
  logRequestInfo, 
  (req, res) => {
    res.redirect("/login");
  }
);

app.post("/api/logout", authenticate, logRequestInfo, (req, res) => {
  req.session.destroy((err) => {
    if (!err) res.redirect("/logout");
    else res.send({ status: "Logout ERROR", body: err });
  });
});

app.get("/", authenticate, logRequestInfo, (req, res) => {
  res.render("main", {});
});

app.get("/api/user-info", authenticate, logRequestInfo, (req, res) => {
  res.status(200).json(req.session.user);
});

app.use("/api/productos", authenticate, logRequestInfo, routerProducts);
app.use("/api/productos-test", authenticate, logRequestInfo, routerProductsMock);
app.use("/info", logRequestInfo, routerInfo);

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

app.get('*', (req, res) => {
  const { url, method } = req;
  logger.warn(`Ruta ${method} ${url} no implementada`);
  res.send(`Ruta ${method} ${url} no se encuentra implementada`);
})

const server = httpServer.listen(PORT, () => {
  console.log(`Listen on ${server.address().port}`);
  console.log(`Server on mode ${MODE}`);
});
server.on("error", (error) => console.log(`Error en el servidor ${error}`));
