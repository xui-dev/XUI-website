import { getAllComponents } from "@/lib/registry";
import ComponentsExploreClient from "@/components/components-page/ComponentsExploreClient";
import { Suspense } from "react";

export const revalidate = 60; // Revalidate every 60 seconds (ISR)

export default async function ComponentsPage() {
  const components = await getAllComponents();

  return (
    <Suspense fallback={null}>
      <ComponentsExploreClient initialComponents={components} />
    </Suspense>
  );
}
