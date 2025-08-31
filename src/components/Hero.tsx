import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-hero/90" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground leading-tight">
              Piceance NOWI Agent
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-3xl mx-auto leading-relaxed">
              Automated acquisition intelligence for non-operated working interest owners in Colorado's Piceance Basin
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-card/10 backdrop-blur-sm p-6 rounded-xl border border-primary-foreground/20 shadow-card">
                <h3 className="text-lg font-semibold text-primary-foreground mb-2">ECMC Orders</h3>
                <p className="text-primary-foreground/80 text-sm">Query Colorado regulator database by PLSS coordinates</p>
              </div>
              <div className="bg-card/10 backdrop-blur-sm p-6 rounded-xl border border-primary-foreground/20 shadow-card">
                <h3 className="text-lg font-semibold text-primary-foreground mb-2">PDF Parsing</h3>
                <p className="text-primary-foreground/80 text-sm">Extract working interest owners from legal documents</p>
              </div>
              <div className="bg-card/10 backdrop-blur-sm p-6 rounded-xl border border-primary-foreground/20 shadow-card">
                <h3 className="text-lg font-semibold text-primary-foreground mb-2">Excel Output</h3>
                <p className="text-primary-foreground/80 text-sm">Generate comprehensive ownership reports with evidence links</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" className="min-w-[200px]">
                Start Analysis
              </Button>
              <Button variant="outline" size="xl" className="min-w-[200px] bg-card/10 backdrop-blur-sm border-primary-foreground/30 text-primary-foreground hover:bg-card/20">
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-primary-foreground/60">
        <p className="text-sm">Garfield & Rio Blanco Counties • Colorado Piceance Basin</p>
      </div>
    </section>
  );
};