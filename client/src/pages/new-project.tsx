import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProjectSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function NewProjectPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm({
    resolver: zodResolver(insertProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      duration: "",
      requiredSkills: [],
      location: null,
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/projects", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Projet créé",
        description: "Votre annonce a été publiée avec succès.",
      });
      setLocation("/my-projects");
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nouvelle annonce</h1>
          <p className="text-gray-600">Créez une nouvelle annonce de projet</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations du projet</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createProjectMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre du projet</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Développement d'une application mobile" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Décrivez votre projet en détail..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catégorie</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une catégorie" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value="tech">Informatique et technologie</SelectItem>
                          <SelectItem value="mobile">Application mobile</SelectItem>
                          <SelectItem value="web">Site internet</SelectItem>
                          <SelectItem value="cloud">Informatique Cloud et Big Data</SelectItem>
                          <SelectItem value="ai">Intelligence Artificielle et Machine Learning</SelectItem>
                          <SelectItem value="blockchain">Blockchain et Cryptomonnaies</SelectItem>
                          <SelectItem value="robotics">Robotique</SelectItem>
                          <SelectItem value="marketing">Marketing et Publicité</SelectItem>
                          <SelectItem value="design">Design et Création</SelectItem>
                          <SelectItem value="hr">Ressources humaines</SelectItem>
                          <SelectItem value="finance">Finance et Comptabilité</SelectItem>
                          <SelectItem value="sales">Vente et Développement Commercial</SelectItem>
                          <SelectItem value="health">Santé</SelectItem>
                          <SelectItem value="engineering">Ingénierie</SelectItem>
                          <SelectItem value="education">Éducation</SelectItem>
                          <SelectItem value="legal">Droit</SelectItem>
                          <SelectItem value="entrepreneurship">Entrepreneuriat</SelectItem>
                          <SelectItem value="architecture">Architecture</SelectItem>
                          <SelectItem value="media">Médias et Communication</SelectItem>
                          <SelectItem value="logistics">Logistique et Transport</SelectItem>
                          <SelectItem value="research">Recherche et développement</SelectItem>
                          <SelectItem value="project">Gestion de Projet</SelectItem>
                          <SelectItem value="industry">Industrie et Production</SelectItem>
                          <SelectItem value="consulting">Conseil</SelectItem>
                          <SelectItem value="tourism">Hôtellerie et Tourisme</SelectItem>
                          <SelectItem value="agriculture">Agriculture et Agroalimentaire</SelectItem>
                          <SelectItem value="energy">Énergie et environnement</SelectItem>
                          <SelectItem value="realestate">Immobilier</SelectItem>
                          <SelectItem value="culture">Art et Culture</SelectItem>
                          <SelectItem value="social">Sciences Sociales</SelectItem>
                          <SelectItem value="telecom">Télécommunications</SelectItem>
                          <SelectItem value="security">Sécurité et Défense</SelectItem>
                          <SelectItem value="public">Administration publique</SelectItem>
                          <SelectItem value="pr">Relations Publiques</SelectItem>
                          <SelectItem value="biotech">Biotechnologie et Pharmaceutique</SelectItem>
                          <SelectItem value="sports">Sports et Loisirs</SelectItem>
                          <SelectItem value="events">Événementiel</SelectItem>
                          <SelectItem value="transport">Transports et Mobilité</SelectItem>
                          <SelectItem value="medical">Médical et paramédical</SelectItem>
                          <SelectItem value="it">Systèmes d'information</SelectItem>
                          <SelectItem value="retail">Commerce de détail</SelectItem>
                          <SelectItem value="food">Restauration</SelectItem>
                          <SelectItem value="fashion">Mode et Textile</SelectItem>
                          <SelectItem value="trade">Commerce international</SelectItem>
                          <SelectItem value="hightech">Haute technologie</SelectItem>
                          <SelectItem value="ecommerce">Commerce électronique</SelectItem>
                          <SelectItem value="gaming">Jeux vidéo et eSports</SelectItem>
                          <SelectItem value="social_media">Réseaux Sociaux et Influenceurs</SelectItem>
                          <SelectItem value="aerospace">Aéronautique et Spatiale</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durée estimée</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une durée" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="short">Court terme (moins de 3 mois)</SelectItem>
                          <SelectItem value="medium">Moyen terme (3-6 mois)</SelectItem>
                          <SelectItem value="long">Long terme (plus de 6 mois)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requiredSkills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compétences requises</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Ex: React, Node.js, UX Design (séparés par des virgules)"
                          onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={createProjectMutation.isPending}>
                  Publier l'annonce
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}