import "./globals.css";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata = {
  metadataBase: new URL("https://nihalt.in"),
  applicationName: "Nihal T Portfolio",
  title: "Nihal T | Full Stack Developer in Kerala",
  description:
    "I'm Nihal T, a full-stack web developer from Kerala. I create fast, modern websites and apps using React, Django, and Flutter. Hire the best web developer in Kozhikode!",
  keywords: [
    "Nihal T",
    "Nihalt",
    "nihal t",
    "nihalt",
    "Nihal Developer",
    "Full Stack Developer in Kerala",
    "Web Developer in Kozhikode",
    "React Developer",
    "Django Developer",
    "Mobile App Developer",
    "Best Web Developer in Kerala",
    "Kerala Web Developer",
    "React Native Developer",
  ],
  authors: [{ name: "Nihal T" }],
  creator: "Nihal T",
  publisher: "Nihal T",
  category: "portfolio",
  referrer: "origin-when-cross-origin",
  robots: "index, follow",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Nihal T | Full Stack Developer",
    description:
      "Explore my portfolio - projects, skills, and contact info. Let's build something amazing together!",
    url: "https://nihalt.in/",
    type: "website",
    images: ["/taj.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nihal T | Full Stack Developer in Kerala",
    description:
      "Portfolio of Nihal T - Full Stack Web & Mobile Developer from Kerala.",
    images: ["/taj.jpg"],
  },
  verification: {
    google: "google-site-verification=bAuy1TxVc6-XqmCkwC8d2OVOeDMOr7VDkt1B6aqjewg",
  },
  icons: {
    icon: "/taj.jpg",
    apple: "/taj.jpg",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#161b1e",
};

export default function RootLayout({ children }) {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Nihal T",
    url: "https://nihalt.in",
    image: "https://nihalt.in/taj.jpg",
    jobTitle: "Full Stack Web & Mobile Developer",
    worksFor: {
      "@type": "Organization",
      name: "Freelance",
    },
    sameAs: [
      "https://github.com/MrNihalT",
      "https://www.linkedin.com/in/nihal-t-8863b3293",
      "https://twitter.com/_nihaal_t",
      "https://www.instagram.com/_nihaal_t",
    ],
    description:
      "Nihal T is a full stack web developer from Kerala, specializing in React and Django",
  };

  return (
    <html lang="en" className={poppins.variable}>
      <head>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-LTTC3D9FVX"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag("js", new Date());
              gtag("config", "G-LTTC3D9FVX");
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </head>
      <body className={poppins.className}>{children}</body>
    </html>
  );
}
