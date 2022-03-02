import container from "../persistence/persistence.js";
import logger from "../utils/logger.js";

class ProductApi {
  constructor() {
    this.productContainer = container("products");
  }

  getProducts = async () => {
    return await this.productContainer.getAll();
  };

  getProductById = async (id) => {
    if (isNaN(parseInt(id))) {
      logger.error("El dato pasado como parámetro es incorrecto.");
      return {
        error: {
          status: 400,
          message: "El dato pasado como parámetro es incorrecto.",
        },
      };
    }

    const product = await this.productContainer.getById(parseInt(id));

    if (!product?.length) {
      logger.error("Producto no encontrado");
      return {
        error: {
          status: 404,
          message: "Producto no encontrado.",
        },
      };
    }
    return product;
  };

  saveProduct = async (product) => {
    await this.productContainer.save(product);
  };

  updateProduct = async (id, product) => {
    if (isNaN(parseInt(id))) {
      logger.error("El dato pasado como parámetro es incorrecto.");
      return {
        error: {
          status: 400,
          message: "El dato pasado como parámetro es incorrecto.",
        },
      };
    }
    
    await this.productContainer.update(product, parseInt(id));
    return product;
  };

  deleteProduct = async (id) => {
    if (isNaN(parseInt(id))) {
      logger.error("El dato pasado como parámetro es incorrecto.");
      return {
        error: {
          status: 400,
          message: "El dato pasado como parámetro es incorrecto.",
        },
      };
    }

    await this.productContainer.deleteById(parseInt(id));

    return { msg: "El producto fue eliminado." };
  };
}

export default ProductApi;
