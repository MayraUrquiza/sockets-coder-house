import { normalize, schema } from "normalizr";

const author = new schema.Entity("authors");
const message = new schema.Entity("messages", { author });
const chat = new schema.Entity("chat", { messages: [message] });

export const normalizeMessages = (messages) => {
  const originalData = { id: "messages", messages };
  const normalizedMessages = normalize(originalData, chat);
  const compression = (
    100 -
    (JSON.stringify(normalizedMessages).length * 100) /
      JSON.stringify(originalData).length
  ).toFixed(2);

  return { normalizedMessages, compression };
};
