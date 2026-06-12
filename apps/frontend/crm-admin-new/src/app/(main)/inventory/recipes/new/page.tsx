"use client";
import dynamic from "next/dynamic";

const RecipeForm = dynamic(
  () => import("@/features/inventory/components/RecipeForm").then((m) => m.RecipeForm),
  { ssr: false },
);

export default function NewRecipePage() {
  return <RecipeForm />;
}
