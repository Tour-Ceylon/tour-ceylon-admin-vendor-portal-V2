import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ToastProvider } from "./components/shared/Toast";

export default function App() {
  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  );
}
