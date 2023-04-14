import { FC, PropsWithChildren } from "react";
import "./globals.css";

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Syllabus Schedule Generator by Conor Roberts",
  description:
    "Don't waste time with due dates. Upload your course syllabus, and get back a file you can import into your favourite calendar app!",
  openGraph: {
    images: [
      {
        width: 1200,
        height: 600,
        url: "https://images.unsplash.com/photo-1580227974546-fbd48825d991?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
      },
    ],
  },
  themeColor: "#4287f5",
  authors: [{ name: "Conor Roberts", url: "https://conorroberts.com" }],
  category: "productivity",
  keywords: ["syllabus", "schedule", "calendar", "ical", "ics"],
};

const Layout: FC<PropsWithChildren> = (props) => {
  return (
    <html lang="en">
      <body className={inter.className}>{props.children}</body>
    </html>
  );
};

export default Layout;
