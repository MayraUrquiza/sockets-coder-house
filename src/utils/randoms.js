if (process.send) process.send({ ready: true });

process.on("message", (qty) => {
  const randoms = generateRandoms(qty);
  const appearances = countRandoms(randoms);

  process.send(appearances);
  process.exit();
});

export const generateRandoms = (qty) => {
  return new Array(Number(qty))
    .fill(0)
    .map(() => Math.floor(Math.random() * 1000));
};

export const countRandoms = (randoms) => {
  const appearances = {};
  randoms.forEach(
    (random) =>
      (appearances[random] = appearances[random] ? appearances[random] + 1 : 1)
  );

  return appearances;
};
