import { Hero } from "@/components/home/hero";
import { ExploreBrain } from "@/components/home/explore-brain";
import { EveryMind } from "@/components/home/every-mind";
import { HumanStories } from "@/components/home/human-stories";
import { Contribute } from "@/components/home/contribute";

export default function Home() {
  return (
    <>
      {/* What Synapse is */}
      <Hero />
      {/* What there is to understand */}
      <ExploreBrain />
      {/* Why it takes many people */}
      <EveryMind />
      {/* Whose questions started it */}
      <HumanStories />
      {/* How to take part */}
      <Contribute />
    </>
  );
}
