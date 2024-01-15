import { generateClient } from "aws-amplify/api";
import { listCategories, getCategory } from "../graphql/queries";

const client = generateClient();

export const getAllCategories = async () => {
  // List all items
  const allCategories = await client.graphql({
    query: listCategories,
  });
  return {
    errors: allCategories.errors,
    data: allCategories.data.listCategories.items,
  };
};

export const getOneCategory = async (id: string) => {
  // Get a specific item
  const oneCategory = await client.graphql({
    query: getCategory,
    variables: { id: id },
  });

  console.log(oneCategory);
};
