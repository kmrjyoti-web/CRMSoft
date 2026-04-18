"use client";
import dynamic from "next/dynamic";

const RecipeDetail = dynamic(
  () => import("@/features/inventory/components/RecipeDetail").then((m) => m.RecipeDetail),
  { ssr: false },
);

export default function RecipeDetailPage({ params }: { params: { id: string } }) {
  return <RecipeDetail id={params.id} />;
}
