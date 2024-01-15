import { generateClient } from "aws-amplify/api";

const SOURCE_BUCKET_URL =
  "https://retail-demo-store-us-east-1.s3.amazonaws.com";

import categories from "./categories.json";
import products from "./products.json";
import { listCategories, listProducts } from "../../graphql/queries";
import { createCategory, createProduct } from "../../graphql/mutations";

const REVIEWS = [1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

interface StatusUpdate {
  categoryProgress: number;
  categoryStatus: String;
  categoryResultText: String;
  productProgress: number;
  productStatus: String;
  productResultText: String;
}

async function LoadSampleData(statusCallback: (status: StatusUpdate) => void) {
  const client = generateClient();

  let localStatus: StatusUpdate = {
    categoryProgress: 0,
    categoryStatus: "in-progress",
    categoryResultText: "",
    productProgress: 0,
    productStatus: "in-progress",
    productResultText: "",
  };

  // Check if categories and products have been loaded already
  let currCategoryCount: number = 0;
  let currProductCount: number = 0;
  let currNextToken: string | undefined | null = "";
  const { errors: catErrors, data: catSub } = await client.graphql({
    query: listCategories,
  });

  console.log(catSub);

  if (catErrors !== undefined) {
    console.error(catErrors);
    localStatus["categoryStatus"] = "error";
    localStatus["categoryResultText"] =
      "Something went wrong trying to verify existing categories";
  } else {
    currCategoryCount = catSub.listCategories.items.length;
  }

  const { errors: prodErrors, data: prodSub } = await client.graphql({
    query: listProducts,
  });

  if (prodErrors !== undefined) {
    console.error(prodErrors);
    localStatus["productStatus"] = "error";
    localStatus["productResultText"] =
      "Something went wrong trying to verify existing products";
  } else {
    currProductCount = prodSub.listProducts.items.length;
  }
  statusCallback(localStatus);

  // Process categories
  const categoriesMap = {} as {
    [name: string]: {
      id: string;
      name: string;
      description: string;
      image: string;
      styles: Array<string>;
    };
  };
  for (const cat of categories) {
    categoriesMap[cat.name] = {
      id: cat.id,
      name: cat.name,
      description: cat.description,
      image: `${SOURCE_BUCKET_URL}/images/${cat.name.toLowerCase()}/${
        cat.image
      }`,
      styles: [],
    };
  }

  // Process products
  for (const prod of products) {
    if (!categoriesMap[prod.category].styles.includes(prod.style)) {
      categoriesMap[prod.category].styles.push(prod.style);
    }
  }

  // Load categories - only load if categories haven't been loaded already
  let numCategories: number = categories.length;
  if (currCategoryCount !== numCategories) {
    console.log("Loading categories");
    let categoryCount: number = currCategoryCount;
    localStatus["categoryProgress"] = (categoryCount / numCategories) * 100;
    for (const cat of categories) {
      const { errors } = await client.graphql({
        query: createCategory,
        variables: {
          input: {
            id: cat.id,
            name: cat.name,
            description: cat.description,
            image: `${SOURCE_BUCKET_URL}/images/${cat.name.toLowerCase()}/${
              cat.image
            }`,
          },
        },
      });

      if (errors !== undefined) {
        console.error(errors);
        if (errors[0].message !== "DynamoDB:ConditionalCheckFailedException") {
          localStatus["categoryStatus"] = "error";
          localStatus[
            "categoryResultText"
          ] = `Error loading categories: ${errors[0].message}`;
          break;
        }
      } else {
        categoryCount += 1;
        localStatus["categoryProgress"] = (categoryCount / numCategories) * 100;
      }
      statusCallback(localStatus);
    }
    if (categoryCount === numCategories) {
      localStatus["categoryStatus"] = "success";
      localStatus["categoryResultText"] =
        "Success! All categories are now loaded.";
      statusCallback(localStatus);
    }
  } else {
    localStatus["categoryStatus"] = "success";
    localStatus["categoryResultText"] = "Categories have already been loaded!";
    statusCallback(localStatus);
  }

  // Load products
  let numProducts: number = products.length;
  if (currProductCount !== numProducts) {
    console.log("Loading products");
    let productCount: number = currProductCount;
    localStatus["productProgress"] = (productCount / numProducts) * 100;
    for (const prod of products) {
      const { errors } = await client.graphql({
        query: createProduct,
        variables: {
          input: {
            id: prod.id,
            name: prod.name,
            categoryID: categoriesMap[prod.category].id,
            current_stock: prod.current_stock,
            description: prod.description,
            image: `${SOURCE_BUCKET_URL}/images/${prod.category.toLowerCase()}/${
              prod.image
            }`,
            price: prod.price,
            style: prod.style,
            rating: REVIEWS[Math.floor(Math.random() * REVIEWS.length)],
          },
        },
      });
      if (errors !== undefined) {
        console.error(errors);
        if (errors[0].message !== "DynamoDB:ConditionalCheckFailedException") {
          localStatus["productStatus"] = "error";
          localStatus[
            "productResultText"
          ] = `Error loading products: ${errors[0].message}`;
          break;
        }
      } else {
        productCount += 1;
        localStatus["productProgress"] = (productCount / numProducts) * 100;
      }
      statusCallback(localStatus);
    }
    if (productCount === numProducts) {
      localStatus["productStatus"] = "success";
      localStatus["productResultText"] =
        "Success! All products are now loaded.";
      statusCallback(localStatus);
    }
  } else {
    localStatus["productStatus"] = "success";
    localStatus["productResultText"] = "Products have already been loaded!";
    statusCallback(localStatus);
  }
  statusCallback(localStatus);
}

export { LoadSampleData };
