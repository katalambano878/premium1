import { Hero } from "@/components/home-v3/Hero";
import { Features } from "@/components/home-v3/Features";
import { Process } from "@/components/home-v3/Process";
import { ServicesDark } from "@/components/home-v3/ServicesDark";
import { IndustriesStrip } from "@/components/home-v3/IndustriesStrip";
import { Closing } from "@/components/home-v3/Closing";
import { CorridorAtlas } from "@/components/home-editorial/CorridorAtlas";
import { Faq } from "@/components/home-editorial/Faq";

export default function Home() {
  return (
    <div>
      <Hero />
      <Features />
      <Process />
      <ServicesDark />
      <IndustriesStrip />
      <CorridorAtlas />
      <Faq />
      <Closing />
    </div>
  );
}
