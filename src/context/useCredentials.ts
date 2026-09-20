import { useContext } from "react";
import { CredentialsContext } from "./credentialsContext";

export default function useCredentials() {
  const context = useContext(CredentialsContext);

  if (!context) {
    throw new Error(
      "useCredentials должен использоваться внутри CredentialsProvider",
    );
  }

  return context;
}
