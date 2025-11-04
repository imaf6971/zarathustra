import { ConvexAuthProvider } from "@convex-dev/auth/react";
import {
  Authenticated,
  ConvexReactClient,
  Unauthenticated,
} from "convex/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App.tsx";
import { Kanban } from "@/components/kanban/index.tsx";
import { Todo } from "@/components/todo/index.tsx";
import { Calendar } from "@/components/calendar/index.tsx";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { Redirect, Route } from "wouter";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <ConvexAuthProvider client={convex}>
        <Unauthenticated>
          <Redirect to="/login" />
          <Route path="/login">
            <App />
          </Route>
        </Unauthenticated>
        <Authenticated>
          <Redirect to="/kanban" />
          <Route path="/kanban">
            <Kanban />
          </Route>
          <Route path="/todo">
            <Todo />
          </Route>
          <Route path="/calendar">
            <Calendar />
          </Route>
        </Authenticated>
      </ConvexAuthProvider>
    </ThemeProvider>
  </StrictMode>
);
