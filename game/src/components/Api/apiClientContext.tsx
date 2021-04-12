import React from "react";
import ApiClient from "./ApiClient";

const apiClient = new ApiClient(localStorage.getItem('gameId'));
export const ApiClientContext = React.createContext(apiClient);