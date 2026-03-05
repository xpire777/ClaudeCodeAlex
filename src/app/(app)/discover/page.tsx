import { personas } from "@/data/personas";
import PersonaCard from "@/components/app/PersonaCard";

export default function DiscoverPage() {
  return (
    <div className="px-5 py-6">
      <h1 className="mb-1 text-xl font-bold tracking-wider">Discover</h1>
      <p className="mb-6 text-sm text-taupe">Find your persona</p>
      <div className="grid grid-cols-2 gap-3">
        {personas.map((persona) => (
          <PersonaCard key={persona.slug} persona={persona} />
        ))}
      </div>
    </div>
  );
}
