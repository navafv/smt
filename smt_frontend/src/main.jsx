import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import App from "./App.jsx";

/**
 * Global Styles & Tailwind Directives
 */
import "./index.css";

/**
 * SMT-OS Bootloader Logic
 * -----------------------
 * We manually remove the initial HTML loader from index.html
 * once the React bundle has successfully hydrated.
 */
const hideInitialLoader = () => {
  const loader = document.getElementById("initial-loader");
  if (loader) {
    loader.style.opacity = "0";
    setTimeout(() => loader.remove(), 500); // Match the CSS transition
  }
};

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("CRITICAL: Root element not found. SMT-OS cannot mount.");
}

// Initialize the App
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        {/* 
            Global Feedback System:
            Optimized for SMT Fruit Shop lighting (Dark theme for high visibility)
        */}
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={12}
          containerStyle={{
            top: 40,
          }}
          toastOptions={{
            duration: 3500,
            style: {
              background: "#0f172a", // Slate-900 (Premium Dark)
              color: "#f8fafc",
              borderRadius: "20px",
              padding: "16px 24px",
              fontSize: "14px",
              fontWeight: "800",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              letterSpacing: "-0.01em",
            },
            success: {
              iconTheme: {
                primary: "#10b981", // Emerald-500
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#f43f5e", // Rose-500
                secondary: "#fff",
              },
            },
          }}
        />

        {/* Main Application Entry */}
        <App onMount={hideInitialLoader} />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
