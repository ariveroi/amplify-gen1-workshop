import { generateClient } from "aws-amplify/api";
import { listProducts, getProduct } from "../graphql/queries";

const client = generateClient();

export const getAllProducts = async () => {
  // List all items
  const allProducts = await client.graphql({
    query: listProducts,
  });
  return allProducts;
};

export const getOneProduct = async (id: string) => {
  // Get a specific item
  const oneProduct = await client.graphql({
    query: getProduct,
    variables: { id: id },
  });

  return { errors: oneProduct.errors, data: oneProduct.data.getProduct };
};

export const getRecommendedProducts = async () => {
  const { errors, data: products } = await getAllProducts();
  const topProducts = products.listProducts.items.sort((a, b) =>
    a.rating! > b.rating! ? 1 : -1
  );
  return { errors: errors, data: topProducts };
};
