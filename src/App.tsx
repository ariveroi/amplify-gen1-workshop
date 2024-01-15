import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import "@aws-amplify/ui-react/styles.css";
import { ThemeProvider, Authenticator } from "@aws-amplify/ui-react";
import { Category, Recommended, Header, Footer, Product } from "./components";

// Config Amplify
import { Amplify } from "aws-amplify";
import config from "./amplifyconfiguration.json";
Amplify.configure(config);

function App() {
  return (
    <ThemeProvider>
      <Authenticator loginMechanisms={["email"]} signUpAttributes={["email"]}>
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<Recommended />} />
            <Route path="/category/:name" element={<Category />} />
            <Route path="/product/:id" element={<Product />} />
          </Routes>
          <Footer />
        </Router>
      </Authenticator>
    </ThemeProvider>
  );
}

export default App;
