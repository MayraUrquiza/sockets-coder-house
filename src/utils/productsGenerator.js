import faker from 'faker';
faker.locale = 'es';

const generateProduct = () => {
  return {
    title: faker.commerce.product(),
    price: faker.commerce.price(),
    thumbnail: faker.random.image(),
  };
};

export default generateProduct;
