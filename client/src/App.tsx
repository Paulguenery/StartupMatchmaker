import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import ProfilePage from "@/pages/profile-page";
import SwipePage from "@/pages/swipe-page";
import MessagesPage from "@/pages/messages-page";
import SubscribePage from "@/pages/subscribe-page";
import MyProjectsPage from "@/pages/my-projects";
import NewProjectPage from "@/pages/new-project";
import { ProtectedRoute } from "./lib/protected-route";
import { Header } from "./components/layout/header";

function Router() {
  return (
    <>
      <Header />
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <ProtectedRoute path="/" component={HomePage} />
        <ProtectedRoute path="/profile" component={ProfilePage} />
        <ProtectedRoute path="/swipe" component={SwipePage} />
        <ProtectedRoute path="/messages" component={MessagesPage} />
        <ProtectedRoute path="/subscribe" component={SubscribePage} />
        <ProtectedRoute path="/my-projects" component={MyProjectsPage} />
        <ProtectedRoute path="/new-project" component={NewProjectPage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;