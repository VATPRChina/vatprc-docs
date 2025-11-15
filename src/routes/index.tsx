import homesectionimage from "@/assets/home-section.png"
import { AboutSection } from "@/components/abuot-vatprc"
import { AsiaApec } from "@/components/asia-apec";
import { useLingui } from "@lingui/react/macro";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

const IndexWithLocale: React.FC = () => {
  const { t } = useLingui();

  return (
    // HomeSection
    <div>
      <section className="relative h-[500px]">
        <img
          src={homesectionimage}
          className="w-full h-full object-cover"
        />

        <div className="col">

        </div>
        <div className="col absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-whit items-start text-white font-bold text-[40px]">
          <h2>VATPRC People's Republic of China</h2>
          <p>中国分部</p>
        </div>
      </section>
      <AboutSection/>
      <AsiaApec/>
    </div>
  )
};

function RouteComponent() {
  return <IndexWithLocale />;
}