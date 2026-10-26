import { createFileRoute } from "@tanstack/react-router";
import { Adventure } from "@/components/Adventure";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dileep Sai Galla — The Castle Portfolio" },
      { name: "description", content: "A cinematic wizarding-castle adventure that reveals the portfolio of Dileep Sai Galla, AI engineer." },
      { property: "og:title", content: "Dileep Sai Galla — The Castle Portfolio" },
      { property: "og:description", content: "Ride the broom, fall into the castle, and choose one of seven doors." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Adventure,
});
