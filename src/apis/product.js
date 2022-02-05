import KnexContainer from "../containers/KnexContainer.js";
import logger from "../utils/logger.js";
import mariaDBOptions from "../utils/mariaDB.js";

class ProductApi {
  constructor() {
    this.productContainer = new KnexContainer("products", mariaDBOptions);
  }

  getProducts = async () => {
    try {
      return await this.productContainer.getAll();
    } catch (error) {
      logger.error("Error al consultar productos", error);
      throw error;
    }
  };

  getProductById = async (id) => {
    try {
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
    } catch (error) {
      logger.error("Error al obtener producto.", error);
      throw error;
    }
  };

  saveProduct = async (product) => {
    try {
      await this.productContainer.save(product);
    } catch (error) {
      logger.error("Error al guardar producto.", error);
      throw error;
    }
  };

  updateProduct = async (id, product) => {
    try {
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
    } catch (error) {
      logger.error("Error al actualizar producto.", error);
      throw error;
    }
  };

  deleteProduct = async (id) => {
    try {
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
    } catch (error) {
      logger.error("Error al eliminar producto.", error);
      throw error;
    }
  };
}

export default ProductApi;
