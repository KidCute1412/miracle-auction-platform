import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import routers from "./routes/AppRouter.tsx";
import "animate.css";
import "@/assets/styles/global.css";
import { Toaster } from "sonner";
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { BreadcrumbProvider } from "@/contexts/BreadcrumbContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

createRoot(document.getElementById("root") as HTMLElement).render(
  <>
    <GoogleReCaptchaProvider
      reCaptchaKey={import.meta.env.VITE_CAPTCHA_SITE_KEY}
      scriptProps={{ async: true, defer: true, appendTo: 'head'}}
    >
      <ThemeProvider>
        <BreadcrumbProvider>
          <Toaster
            richColors
            closeButton
            position="top-right"
            toastOptions={{
              style: {
                fontSize: "14px",
                padding: "8px 12px",
                width: "auto",
                height: "50px",
                borderRadius: "8px",
              },
            }}
          />
          <RouterProvider router={routers} />
        </BreadcrumbProvider>
      </ThemeProvider>
    </GoogleReCaptchaProvider>
  </>
);
