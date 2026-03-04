import Hero from "@/components/Hero";
import About from "@/components/About";
import Teaser from "@/components/Teaser";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Teaser />
      <FAQ />
      <Footer />
    </main>
  );
}
