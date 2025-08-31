import { Hero } from "@/components/Hero";
import { NOWIDataManager } from "@/components/NOWIDataManager";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Hero />
      <NOWIDataManager />
    </main>
  );
};

export default Index;