import Layout from "@/components/Layout";

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return <Layout lang="en">{children}</Layout>;
}