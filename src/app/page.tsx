import { ExperienceSection } from "@/components/experience-section";
import { HeroSection } from "@/components/hero-section";
import { MenuSection } from "@/components/menu-section";
import { ReservationSection } from "@/components/reservation-section";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#38bdf81a,transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(14,116,144,0.2),transparent_55%)]" />
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px,rgba(148,163,184,0.15)1px,transparent_0)] [background-size:24px_24px]" />
      </div>
      <main className="relative z-10 flex-1">
        <HeroSection />
        <ExperienceSection />
        <MenuSection />
        <ReservationSection />
      </main>
      <SiteFooter />
    </div>
  );
}