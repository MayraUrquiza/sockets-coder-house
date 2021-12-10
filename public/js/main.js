const socket = io();

const loadProducts = async (products) => {
  const template = await searchProductsTemplate();
  const html = getHtml(template, { products });

  document.getElementById("products").innerHTML = html;
};

const searchProductsTemplate = async () => {
  const res = await fetch("/templates/products.hbs");
  return await res.text();
};

// socket.on("refreshProducts", (products) => {
//   loadProducts(products);
// });

const addProduct = (form) => {
  const product = {
    title: form["title"].value,
    price: form["price"].value,
    thumbnail: form["thumbnail"].value,
  };
  socket.emit("addProduct", product);

  form.reset();
  return false;
};

const loadMessages = async (messages, compression) => {
  const template = await searchMessagesTemplate();
  const html = getHtml(template, { messages });

  document.getElementById("messages").innerHTML = html;
  document.getElementById("messages").scrollTop =
    document.getElementById("messages").scrollHeight;
  document.getElementById(
    "compression"
  ).innerText = `Porcentaje de compresión: ${compression}%`;
};

const searchMessagesTemplate = async () => {
  const res = await fetch("/templates/messages.hbs");
  return await res.text();
};

socket.on("refreshMessages", (messages, compression) => {
  const denormalizedMessages = denormalizeMessages(messages);
  loadMessages(denormalizedMessages.messages, compression);
});

const addMessage = (form) => {
  const message = {
    author: {
      id: form["email"].value,
      nombre: form["nombre"].value,
      apellido: form["apellido"].value,
      edad: form["edad"].value,
      alias: form["alias"].value,
      avatar: form["avatar"].value,
    },
    text: form["text"].value,
    date: new Date().toLocaleString(),
  };

  socket.emit("addMessage", message);

  form.reset();
  return false;
};

const getHtml = (template, items) => {
  const render = Handlebars.compile(template);
  return render(items);
};

fetch("/api/productos-test")
  .then((res) => {
    res.json().then((data) => {
      loadProducts(data);
    });
  })
  .catch((error) => {
    console.log(error);
  });

const denormalizeMessages = (normalizedMessages) => {
  const author = new normalizr.schema.Entity("authors");
  const message = new normalizr.schema.Entity("messages", { author });
  const chat = new normalizr.schema.Entity("chat", { messages: [message] });

  const denormalizedMessages = normalizr.denormalize(
    normalizedMessages.result,
    chat,
    normalizedMessages.entities
  );

  return denormalizedMessages;
};

fetch("/api/user-info")
  .then((res) => {
    res.json().then((data) => {
      document.getElementById("welcome-message").innerText = `Bienvenido ${data}`;
    });
  })
  .catch((error) => {
    console.log(error);
  });