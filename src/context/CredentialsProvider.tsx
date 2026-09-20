import { useState } from "react";
import type { ReactNode } from "react";
import { CredentialsContext, initialCredentials } from "./credentialsContext";
import type { IGreenApiCredentials } from "../interface/greenApi";

interface ICredentialsProviderProps {
  children: ReactNode;
}

export default function CredentialsProvider({
  children,
}: ICredentialsProviderProps) {
  const [credentials, setCredentials] =
    useState<IGreenApiCredentials>(initialCredentials);

  return (
    <CredentialsContext.Provider
      value={{
        credentials,
        setCredentials,
      }}
    >
      {children}
    </CredentialsContext.Provider>
  );
}
