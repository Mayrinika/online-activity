import React from "react";
import ApiClient from "./ApiClient";

const apiClient = new ApiClient('');
export const ApiClientContext = React.createContext(apiClient);