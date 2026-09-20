import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import CredentialsProvider from "./context/CredentialsProvider";
import "./styles/globals.scss";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CredentialsProvider>
      <App />
    </CredentialsProvider>
  </StrictMode>,
);
