import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/ho-so/"],
    },
    sitemap: "https://sekar.vn/sitemap.xml", // Replace with actual domain
  };
}
