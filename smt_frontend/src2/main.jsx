import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import App from "./App.jsx";

import "./index.css";

// Managed safety unmount logic inside a microtask frame
const hideInitialLoader = () => {
  const loader = document.getElementById("initial-loader");
  if (loader) {
    loader.style.opacity = "0";
    setTimeout(() => loader.remove(), 400); // Matched with index.html transition
  }
};

// Simplified App mounting lifecycles wrapper
const AppRunner = () => {
  useEffect(() => {
    hideInitialLoader();
  }, []);

  return <App />;
};

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right" // Standard for professional dashboard viewports
          reverseOrder={false}
          gutter={12}
          containerStyle={{
            // Dynamic viewport cushioning to prevent layout overlapping on headers
            top: "24px",
            left: "24px",
            right: "24px",
            bottom: "24px",
          }}
          toastOptions={{
            duration: 3500,
            style: {
              // Premium, high-contrast, clean system glassmorphism look
              background: "#ffffff",
              color: "#1e293b", // slate-800
              borderRadius: "16px",
              padding: "14px 20px",
              fontSize: "14px",
              fontWeight: "600",
              boxShadow:
                "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
              maxWidth: "420px",
              border: "1px solid #f1f5f9",
            },
            success: {
              iconTheme: {
                primary: "#10b981", // SMT Brand Emerald
                secondary: "#ffffff",
              },
              duration: 3000,
            },
            error: {
              iconTheme: {
                primary: "#ef4444", // Modern warning Red
                secondary: "#ffffff",
              },
              duration: 4000, // Error messages need slightly longer time to read safely
            },
            loading: {
              style: {
                background: "#f8fafc",
                color: "#64748b",
              },
            },
          }}
        />
        <AppRunner />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
