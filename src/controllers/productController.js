const { container } = require("../containers/KnexContainer.js");
const mariaDBOptions = require("../utils/mariaDB");

class ProductController {
  constructor() {
    this.productContainer = container("products", mariaDBOptions);
  }

  getProducts = async (req, res) => {
    try {
      const products = await this.productContainer.getAll();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  getProductById = async (req, res) => {
    try {
      const { id } = req.params;

      if (isNaN(parseInt(id)))
        res
          .status(400)
          .json({ error: "El dato pasado como parámetro es incorrecto." });

      const product = await this.productContainer.getById(parseInt(id));

      if (!product) res.status(404).json({ error: "Producto no encontrado." });
      else res.status(200).json({ product });
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  saveProduct = async (req, res) => {
    try {
      const { title, price, thumbnail } = req.body;
      const product = {
        title,
        price: parseInt(price),
        thumbnail,
      };

      await this.productContainer.save(product);
      res.status(200).json({ msg: "El producto fue creado.", product })
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  updateProduct = async (req, res) => {
    try {
      const { title, price, thumbnail } = req.body;
      const { id } = req.params;
      const product = {
        title,
        price: parseInt(price),
        thumbnail,
      };

      await this.productContainer.update(product, parseInt(id));

      res.status(200).json({ msg: "El producto fue actualizado.", product });
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  deleteProduct = async (req, res) => {
    try {
      const { id } = req.params;

      await this.productContainer.deleteById(parseInt(id));

      res.status(200).json({ msg: "El producto fue eliminado." });
    } catch (error) {
      res.status(500).json({ error });
    }
  };
}

exports.ProductController = ProductController;
