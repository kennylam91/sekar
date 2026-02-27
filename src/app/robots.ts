import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/ho-so/"],
    },
    sitemap: "https://sekar.cloud/sitemap.xml",
  };
}
