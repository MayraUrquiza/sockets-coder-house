import { countRandoms, generateRandoms } from "../utils/randoms.js";
import { fork } from "child_process";

class RandomController {
  getRandomsNonBlocking = async (req, res) => {
    try {
      const qty = req.query.cant || 100000000;
      const child = fork("./src/utils/randoms.js");

      child.on("message", ({ ready }) => {
        if (ready) {
          child.send(qty);
          child.on("message", (message) => {
            res.status(200).json(message);
          });
        }
      });
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  getRandomsBlocking = async (req, res) => {
    try {
      const qty = req.query.cant || 100000000;

      const randoms = generateRandoms(qty);
      const appearances = countRandoms(randoms);

      res.status(200).json(appearances);
    } catch (error) {
      res.status(500).json({ error });
    }
  };
}

export default RandomController;
