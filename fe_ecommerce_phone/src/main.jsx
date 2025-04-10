import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ThemeProvider } from "./context/AppThemeContext";
import { AppProvider } from "./context/AppContext";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <AppProvider>
                <ThemeProvider>
                    <App />
                </ThemeProvider>
            </AppProvider>
        </BrowserRouter>
    </React.StrictMode>
);
