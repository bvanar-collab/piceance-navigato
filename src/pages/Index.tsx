import { Hero } from "@/components/Hero";
import { PLSSForm } from "@/components/PLSSForm";
import { Dashboard } from "@/components/Dashboard";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Hero />
      <PLSSForm />
      <Dashboard />
    </main>
  );
};

export default Index;