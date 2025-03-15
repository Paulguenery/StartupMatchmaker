import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Suggestion } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSuggestionSchema } from "@shared/schema";
import { ThumbsUp } from "lucide-react";

export default function SuggestionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(insertSuggestionSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "pending",
    },
  });

  const { data: suggestions } = useQuery<Suggestion[]>({
    queryKey: ["/api/suggestions"],
  });

  const createSuggestionMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/suggestions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] });
      toast({
        title: "Suggestion envoyée",
        description: "Merci pour votre contribution à l'amélioration de la plateforme !",
      });
      form.reset();
    },
  });

  const voteMutation = useMutation({
    mutationFn: async (suggestionId: number) => {
      const res = await apiRequest("POST", `/api/suggestions/${suggestionId}/vote`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Suggestions d'amélioration</h1>
          <p className="text-gray-600">Proposez vos idées pour améliorer la plateforme</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nouvelle suggestion</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createSuggestionMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Ajout d'une fonctionnalité de chat vidéo" />
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
                        <Textarea {...field} placeholder="Décrivez votre suggestion en détail..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={createSuggestionMutation.isPending}>
                  Soumettre la suggestion
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Suggestions de la communauté</h2>
          {!suggestions?.length ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-600">
                <p>Aucune suggestion pour le moment. Soyez le premier à proposer une amélioration !</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {suggestions.map((suggestion) => (
                <Card key={suggestion.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{suggestion.title}</h3>
                        <p className="text-gray-600 mt-2">{suggestion.description}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => voteMutation.mutate(suggestion.id)}
                        className="flex items-center gap-2"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        {suggestion.votes}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
