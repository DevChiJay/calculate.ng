import type { MetadataRoute } from "next";
import { pages } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Calculate.ng",
    short_name: "Calculate.ng",
    description: pages["/"].description,
    start_url: "/",
    display: "standalone",
    background_color: "#07090d",
    theme_color: "#07090d",
    lang: "en-NG",
  };
}
