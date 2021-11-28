import generateProduct from "../utils/productsGenerator.js";

class ProductMockController {
  getProducts = async (req, res) => {
    try {
      const items = req.query.items ? parseInt(req.query.items) : 5;
      const products = [];
      for (let index = 0; index < items; index++) {
        const product = { id: index + 1, ...generateProduct() };
        products.push(product);
      }

      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error });
    }
  };
}

export default ProductMockController;
