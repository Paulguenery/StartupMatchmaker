import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Star, Check, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Clé publique Stripe manquante: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/profile`,
      },
    });

    if (error) {
      toast({
        title: "Échec du paiement",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button type="submit" className="w-full" disabled={!stripe}>
        S'abonner maintenant
      </Button>
    </form>
  );
};

const ProjectOwnerBenefits = () => (
  <ul className="space-y-4">
    <li className="flex items-center gap-2">
      <Check className="h-5 w-5 text-green-500" />
      <span>Mise en avant prioritaire dans les résultats</span>
    </li>
    <li className="flex items-center gap-2">
      <Check className="h-5 w-5 text-green-500" />
      <span>Badge Premium pour renforcer la crédibilité</span>
    </li>
    <li className="flex items-center gap-2">
      <Check className="h-5 w-5 text-green-500" />
      <span>Voir qui a consulté votre projet</span>
    </li>
    <li className="flex items-center gap-2">
      <Check className="h-5 w-5 text-green-500" />
      <span>Messagerie instantanée illimitée</span>
    </li>
    <li className="flex items-center gap-2">
      <Check className="h-5 w-5 text-green-500" />
      <span>Filtres de recherche avancés</span>
    </li>
    <li className="flex items-center gap-2">
      <Check className="h-5 w-5 text-green-500" />
      <span>Support client prioritaire</span>
    </li>
  </ul>
);

const ProjectSeekerBenefits = () => (
  <ul className="space-y-4">
    <li className="flex items-center gap-2">
      <Check className="h-5 w-5 text-green-500" />
      <span>Accès illimité aux projets Premium</span>
    </li>
    <li className="flex items-center gap-2">
      <Check className="h-5 w-5 text-green-500" />
      <span>Contact direct avec les porteurs de projet</span>
    </li>
    <li className="flex items-center gap-2">
      <Check className="h-5 w-5 text-green-500" />
      <span>Messagerie illimitée</span>
    </li>
    <li className="flex items-center gap-2">
      <Check className="h-5 w-5 text-green-500" />
      <span>Filtres de recherche avancés</span>
    </li>
    <li className="flex items-center gap-2">
      <Check className="h-5 w-5 text-green-500" />
      <span>Voir qui a consulté votre profil</span>
    </li>
    <li className="flex items-center gap-2">
      <Check className="h-5 w-5 text-green-500" />
      <span>Suggestions intelligentes de projets</span>
    </li>
  </ul>
);

export default function SubscribePage() {
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    setIsLoading(true);
    apiRequest("POST", "/api/get-or-create-subscription")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erreur lors de la création de l'abonnement");
        }
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          throw new Error(data.error.message);
        }
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        toast({
          title: "Erreur",
          description: error.message || "Impossible de démarrer le processus d'abonnement.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Préparation de votre abonnement...</p>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" size="icon" className="mb-6" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Card className="p-6 text-center">
            <p className="text-red-600">Une erreur est survenue lors de la préparation de l'abonnement.</p>
            <Button className="mt-4" variant="outline" asChild>
              <Link href="/">Retour à l'accueil</Link>
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          size="icon"
          className="mb-6"
          asChild
        >
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Passez à Premium</h1>
          <p className="text-gray-600 mt-2">
            Débloquez toutes les fonctionnalités et boostez votre expérience professionnelle
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Avantages Premium
              </CardTitle>
              <CardDescription>
                {user?.role === 'project_owner'
                  ? "Tout ce qui est inclus pour les porteurs de projet"
                  : "Tout ce qui est inclus pour les chercheurs de projet"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user?.role === 'project_owner'
                ? <ProjectOwnerBenefits />
                : <ProjectSeekerBenefits />}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Formulaire de paiement</CardTitle>
              <CardDescription>
                Abonnement mensuel sécurisé par Stripe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <SubscribeForm />
              </Elements>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}