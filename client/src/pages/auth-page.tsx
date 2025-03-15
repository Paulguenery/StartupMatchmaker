import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { z } from "zod";

// Schéma de validation simplifié pour le login
const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
        <div className="space-y-6">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold text-gray-900">Mymate</h1>
            <p className="mt-2 text-lg text-gray-600">
              La plateforme de référence pour les projets professionnels
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <LoginForm />
            </TabsContent>

            <TabsContent value="register">
              <RegisterForm />
            </TabsContent>
          </Tabs>
        </div>

        <div className="hidden md:block">
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">
                Développez votre réseau professionnel
              </h2>
              <p className="text-lg text-gray-600">
                Rejoignez une communauté de professionnels qualifiés et
                trouvez les meilleures opportunités de collaboration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const { loginMutation } = useAuth();
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connexion</CardTitle>
        <CardDescription>Accédez à votre espace personnel</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} placeholder="vous@exemple.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe *</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      {...field} 
                      placeholder="Votre mot de passe" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Connexion en cours..." : "Se connecter"}
            </Button>

            {loginMutation.error && (
              <p className="text-sm text-red-500 mt-2">
                {loginMutation.error.message}
              </p>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function RegisterForm() {
  const { registerMutation } = useAuth();
  const form = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      role: "project_owner",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inscription</CardTitle>
        <CardDescription>Créez votre compte professionnel</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => registerMutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom complet *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Jean Dupont" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} placeholder="vous@exemple.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe *</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} placeholder="Minimum 8 caractères" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Votre rôle *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue="project_owner">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre rôle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="project_owner">Porteur de projet</SelectItem>
                      <SelectItem value="project_seeker">Chercheur de projet</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Inscription en cours..." : "S'inscrire"}
            </Button>

            {registerMutation.error && (
              <p className="text-sm text-red-500 mt-2">
                {registerMutation.error.message}
              </p>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}