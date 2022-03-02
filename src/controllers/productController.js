import ProductApi from "../services/product.js";
class ProductController {
  constructor() {
    this.productsApi = new ProductApi();
  }

  getProducts = async (req, res) => {
    try {
      const products = await this.productsApi.getProducts();
      res.status(200).json(products);
    } catch (error) {
      logger.error("Error al consultar productos", error);
      res.status(500).json({ error });
    }
  };

  getProductById = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.productsApi.getProductById(id);

      if (result.error) {
        res.status(result.error.status).json({ error: result.error.message });
      } else {
        res.status(200).json({ product: result });
      }
    } catch (error) {
      logger.error("Error al obtener producto.", error);
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

      await this.productsApi.saveProduct(product);
      res.status(200).json({ msg: "El producto fue creado.", product });
    } catch (error) {
      logger.error("Error al guardar producto.", error);
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

      const result = await this.productsApi.updateProduct(id, product);

      if (result.error) {
        res.status(result.error.status).json({ error: result.error.message });
      } else {
        res.status(200).json({ msg: "El producto fue actualizado.", product: result });
      }
    } catch (error) {
      logger.error("Error al actualizar producto.", error);
      res.status(500).json({ error });
    }
  };

  deleteProduct = async (req, res) => {
    try {
      const { id } = req.params;

      const result = await this.productsApi.deleteProduct(id);

      if (result.error) {
        res.status(result.error.status).json({ error: result.error.message });
      } else {
        res.status(200).json(result);
      }
    } catch (error) {
      logger.error("Error al eliminar producto.", error);
      res.status(500).json({ error });
    }
  };
}

export default ProductController;
