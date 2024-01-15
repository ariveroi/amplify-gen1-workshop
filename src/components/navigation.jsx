import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import SideNavigation from "@cloudscape-design/components/side-navigation";

import * as api from "../api/index";

export default function Navigation(props) {
  let navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  // handle navigation changes
  const routeChange = (path) => {
    navigate(path);
  };

  useEffect(() => {
    // Query categories for building the menu
    async function queryCategories() {
      if (categories.length === 0) {
        try {
          const { data: categories, errors: errors } =
            await api.categories.getAllCategories();
          console.log("fetching categories");
          setCategories(categories.sort((a, b) => (a.name > b.name ? 1 : -1)));
        } catch (error) {
          console.log("Error retrieving categories", error);
        }
      }
    }
    queryCategories();
  }, []);

  return (
    <SideNavigation
      activeHref={props.activeHref}
      header={{ href: "/", text: "Categories" }}
      onFollow={(event) => {
        if (!event.detail.external) {
          event.preventDefault();
          routeChange(event.detail.href);
        }
      }}
      items={categories.map((c) => {
        return {
          type: "link",
          text: c.name,
          href: `/category/${c.name}`,
        };
      })}
    />
  );
}
