'use client';

interface HeroEditorialProps {
  updatesCount: number;
}

export default function HeroEditorial({ updatesCount }: HeroEditorialProps) {
  return (
    <section className="relative min-h-screen flex items-center bg-black overflow-hidden">
      {/* Fond noir pur avec grain subtil */}
      <div className="absolute inset-0 bg-black"></div>

      {/* Contenu ultra-minimaliste */}
      <div className="relative z-10 container mx-auto px-6 lg:px-12 py-32 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-20 lg:gap-24 items-center">
          {/* Colonne gauche - Typographie monumentale */}
          <div className="space-y-16">
            {/* Label micro */}
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10"></div>
              <span className="text-[10px] font-sans uppercase tracking-[0.6em] text-[#00BCD4]">
                Iceland • Août 2026
              </span>
              <div className="h-px w-12 bg-[#00BCD4]"></div>
            </div>

            {/* Titre monumental */}
            <div>
              <h1 className="mb-8">
                <span className="block text-8xl md:text-9xl font-display font-black text-white tracking-tighter leading-[0.85] mb-6">
                  ÍSLAND
                </span>
                <span className="block text-4xl md:text-5xl font-editorial italic text-white/80 tracking-wide">
                  Terre de glace et de feu
                </span>
              </h1>
            </div>

            {/* Texte éditorial */}
            <div className="max-w-xl">
              <p className="text-base md:text-lg font-editorial leading-relaxed text-white/60 drop-cap">
                Douze jours à traverser une île où les glaciers millénaires rencontrent les volcans incandescents. 
                Un voyage aux confins du monde civilisé, là où la nature règne en maître absolu et dicte ses lois 
                avec une beauté sauvage et indomptée.
              </p>
            </div>

            {/* Stats minimalistes */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/10">
              <div>
                <div className="text-5xl font-display font-black text-[#00BCD4] mb-2">12</div>
                <div className="text-[10px] font-sans uppercase tracking-[0.4em] text-white/30">Jours</div>
              </div>
              <div>
                <div className="text-5xl font-display font-black text-[#00BCD4] mb-2">{updatesCount}</div>
                <div className="text-[10px] font-sans uppercase tracking-[0.4em] text-white/30">Étapes</div>
              </div>
              <div>
                <div className="text-5xl font-display font-black text-[#00BCD4] mb-2">∞</div>
                <div className="text-[10px] font-sans uppercase tracking-[0.4em] text-white/30">Souvenirs</div>
              </div>
            </div>

            {/* CTA minimalistes */}
            <div className="flex gap-4 pt-8">
              <a
                href="#updates"
                className="px-8 py-4 bg-[#00BCD4] text-black font-sans uppercase tracking-[0.4em] text-[10px] hover:bg-white transition-all duration-300"
              >
                Découvrir le voyage
              </a>
              <a
                href="#carte"
                className="px-8 py-4 border-2 border-white/10 text-white/60 font-sans uppercase tracking-[0.4em] text-[10px] hover:border-[#00BCD4] hover:text-[#00BCD4] transition-all duration-300"
              >
                Itinéraire
              </a>
            </div>
          </div>

          {/* Colonne droite - Citation minimaliste */}
          <div className="hidden lg:block">
            <div className="relative p-16 border border-white/10 hover:border-[#00BCD4]/50 transition-all duration-500">
              <blockquote className="text-center">
                <p className="text-2xl md:text-3xl font-editorial italic text-white/70 leading-relaxed mb-8">
                  « Il est des terres qui vous changent à jamais. L'Islande est de celles-là. »
                </p>
                <footer className="text-[10px] font-sans uppercase tracking-[0.5em] text-[#00BCD4]">
                  — Notre carnet de voyage
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator minimaliste */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
        <div className="flex flex-col items-center gap-3 text-white/30 animate-bounce">
          <span className="text-[10px] uppercase tracking-[0.5em] font-sans">Défiler</span>
          <div className="w-px h-16 bg-gradient-to-b from-white/30 to-transparent"></div>
        </div>
      </div>
    </section>
  );
}
