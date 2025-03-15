import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Shield, Star, LogOut, FileText, Image, Award, BriefcaseIcon, GraduationCap, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      email: user?.email || "",
      fullName: user?.fullName || "",
      bio: user?.bio || "",
      skills: user?.skills || [],
      location: user?.location || null,
      role: user?.role || "",
      experienceLevel: user?.experienceLevel || "",
      education: user?.education || "",
      availability: user?.availability || "",
      documents: user?.documents || []
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      for (const key in data) {
        if (key === 'documents' && Array.isArray(data.documents) && data.documents.length > 0) {
          data.documents.forEach((doc: any, index: number) => {
            formData.append(`documents[${index}].type`, doc.type);
            formData.append(`documents[${index}].url`, doc.url);
          });
        } else {
          formData.append(key, data[key]);
        }
      }
      const res = await apiRequest("PATCH", "/api/user/profile", formData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées avec succès.",
      });
    },
  });

  const handleFileUpload = (type: string, file: File) => {
    setSelectedFile(file);
    const currentDocs = form.getValues("documents") || [];
    form.setValue("documents", [
      ...currentDocs.filter(doc => doc.type !== type),
      { type, url: URL.createObjectURL(file) }
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profil</h1>
            <p className="text-gray-600">Gérez votre profil professionnel et vos documents</p>
          </div>
          <div className="flex gap-2">
            {user?.isVerified ? (
              <Badge variant="default" className="gap-1">
                <Shield className="h-4 w-4" /> Vérifié
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                En attente de vérification
              </Badge>
            )}
            {user?.isPremium ? (
              <Badge variant="default" className="gap-1">
                <Star className="h-4 w-4" /> Premium
              </Badge>
            ) : (
              <Button variant="outline" asChild>
                <a href="/subscribe">Devenir Premium</a>
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(data => updateProfileMutation.mutate(data))} className="space-y-6">
                {/* Section Informations de base */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom complet</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Localisation</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                            <Input {...field} className="pl-8" placeholder="Ville, Pays" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="my-6" />

                {/* Section Profil Professionnel */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Profil Professionnel</h3>

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Biographie professionnelle</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Décrivez votre parcours, vos intérêts professionnels et vos objectifs..."
                            className="min-h-[150px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="experienceLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Niveau d'expérience</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <BriefcaseIcon className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                            <Input {...field} className="pl-8" placeholder="Ex: 5 ans d'expérience" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="education"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Formation</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <GraduationCap className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                            <Input {...field} className="pl-8" placeholder="Ex: Master en Développement Web" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="my-6" />

                {/* Section Documents Professionnels */}
                {user?.role === "project_seeker" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Documents professionnels</h3>

                    <div className="grid gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <Label className="text-sm font-medium">CV</Label>
                        </div>
                        <Input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload("resume", file);
                          }}
                          accept=".pdf,.doc,.docx"
                          className="cursor-pointer"
                        />
                        <p className="text-sm text-muted-foreground">
                          Format accepté : PDF, DOC, DOCX
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Image className="h-4 w-4 text-gray-500" />
                          <Label className="text-sm font-medium">Portfolio</Label>
                        </div>
                        <Input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload("portfolio", file);
                          }}
                          accept=".pdf,.jpg,.jpeg,.png,.zip"
                          className="cursor-pointer"
                        />
                        <p className="text-sm text-muted-foreground">
                          Format accepté : PDF, JPG, PNG, ZIP
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-gray-500" />
                          <Label className="text-sm font-medium">Certifications</Label>
                        </div>
                        <Input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload("certification", file);
                          }}
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="cursor-pointer"
                        />
                        <p className="text-sm text-muted-foreground">
                          Format accepté : PDF, JPG, PNG
                        </p>
                      </div>
                    </div>

                    {/* Affichage des documents actuels */}
                    <div className="mt-6 space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">Documents téléchargés</h4>
                      {form.getValues("documents")?.map((doc: any) => (
                        <div key={doc.type} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {doc.type === "resume" && <FileText className="h-4 w-4" />}
                          {doc.type === "portfolio" && <Image className="h-4 w-4" />}
                          {doc.type === "certification" && <Award className="h-4 w-4" />}
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {doc.type === "resume" && "CV"}
                            {doc.type === "portfolio" && "Portfolio"}
                            {doc.type === "certification" && "Certification"}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-6">
                  <Button type="submit" disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending ? "Enregistrement..." : "Enregistrer les modifications"}
                  </Button>

                  <Button 
                    variant="destructive" 
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Se déconnecter
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}