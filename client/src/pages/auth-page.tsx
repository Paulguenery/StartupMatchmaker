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
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Label } from "@/components/ui/label";


// Schéma de validation modifié pour le login
const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
  rememberMe: z.boolean().default(false)
});

// Schéma pour la réinitialisation du mot de passe
const resetPasswordSchema = z.object({
  email: z.string().email("Email invalide")
});

type LoginFormData = z.infer<typeof loginSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function AuthPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [showResetPassword, setShowResetPassword] = useState(false);

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

          {showResetPassword ? (
            <ResetPasswordForm onBack={() => setShowResetPassword(false)} />
          ) : (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="register">Inscription</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <LoginForm onForgotPassword={() => setShowResetPassword(true)} />
              </TabsContent>

              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          )}
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

function LoginForm({ onForgotPassword }: { onForgotPassword: () => void }) {
  const { loginMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
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
                  <div className="relative">
                    <FormControl>
                      <Input 
                        type={showPassword ? "text" : "password"}
                        {...field} 
                        placeholder="Votre mot de passe" 
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Se souvenir de moi</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="link"
                className="px-0"
                onClick={onForgotPassword}
              >
                Mot de passe oublié ?
              </Button>
            </div>

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

function ResetPasswordForm({ onBack }: { onBack: () => void }) {
  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Une erreur est survenue');
      }

      // Afficher un message de succès
      form.reset();
      onBack(); // Go back after successful submission
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Réinitialisation du mot de passe</CardTitle>
        <CardDescription>
          Entrez votre email pour recevoir un lien de réinitialisation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} placeholder="vous@exemple.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between space-x-2">
              <Button type="button" variant="outline" onClick={onBack}>
                Retour
              </Button>
              <Button type="submit">
                Envoyer le lien
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

const documentTypes = {
  PROJECT_OWNER: ["business_registration", "company_id"],
  PROJECT_SEEKER: ["id_card", "resume", "portfolio", "professional_certifications"],
};

function RegisterForm() {
  const { registerMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("project_owner");

  const form = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      role: "project_owner",
      referredBy: "",
      documents: []
    },
  });

  // Obtenir les documents requis en fonction du rôle
  const requiredDocuments = selectedRole === "project_owner" 
    ? documentTypes.PROJECT_OWNER 
    : documentTypes.PROJECT_SEEKER;

  const handleFileUpload = async (type: string, file: File) => {
    // TODO: Implémenter le téléchargement réel des fichiers
    // Pour l'instant, on simule juste l'URL
    const fakeUrl = `https://storage.example.com/${file.name}`;
    const currentDocs = form.getValues("documents") || [];

    // Mettre à jour les documents
    const updatedDocs = [
      ...currentDocs.filter(doc => doc.type !== type),
      { type, url: fakeUrl }
    ];

    form.setValue("documents", updatedDocs);
  };

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
                  <div className="relative">
                    <FormControl>
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        {...field} 
                        placeholder="Minimum 8 caractères" 
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
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
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedRole(value);
                    }} 
                    defaultValue={field.value}
                  >
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

            <div className="space-y-4">
              <Label>Documents requis *</Label>
              {requiredDocuments.map((docType) => (
                <div key={docType} className="flex items-center gap-4">
                  <Input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(docType, file);
                      }
                    }}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <p className="text-sm text-muted-foreground">
                    {docType === "business_registration" && "Immatriculation entreprise"}
                    {docType === "company_id" && "Identité de l'entreprise"}
                    {docType === "professional_license" && "Licence professionnelle"}
                    {docType === "id_card" && "Pièce d'identité"}
                    {docType === "resume" && "CV"}
                    {docType === "portfolio" && "Portfolio"}
                    {docType === "professional_certifications" && "Certifications professionnelles"}
                  </p>
                </div>
              ))}
            </div>

            <FormField
              control={form.control}
              name="referredBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code de parrainage (optionnel)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Entrez votre code de parrainage" />
                  </FormControl>
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