import { createContext } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { IGreenApiCredentials } from "../interface/greenApi";

interface ICredentialsContext {
  credentials: IGreenApiCredentials;
  setCredentials: Dispatch<SetStateAction<IGreenApiCredentials>>;
}

export const initialCredentials: IGreenApiCredentials = {
  idInstance: "",
  apiTokenInstance: "",
};

export const CredentialsContext = createContext<ICredentialsContext | null>(
  null,
);
