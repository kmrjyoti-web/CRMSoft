"use client";
import dynamic from "next/dynamic";

const RecipeList = dynamic(
  () => import("@/features/inventory/components/RecipeList").then((m) => m.RecipeList),
  { ssr: false },
);

export default function RecipesPage() {
  return <RecipeList />;
}
