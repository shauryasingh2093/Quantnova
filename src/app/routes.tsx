import { createBrowserRouter } from "react-router";
import { MainLayout } from "./components/MainLayout";
import { Dashboard } from "./components/Dashboard";
import { BotConfiguration } from "./components/BotConfiguration";
import { Analytics } from "./components/Analytics";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "configure", Component: BotConfiguration },
      { path: "analytics", Component: Analytics },
    ],
  },
]);
