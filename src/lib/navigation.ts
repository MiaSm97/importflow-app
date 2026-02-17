import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Sections } from "@/lib/types/types";

export function getSectionPath(step: Sections, importId?: string) {
  switch (step) {
    case Sections.DASHBOARD:
      return "/dashboard";
    case Sections.IMPORTS:
      return "/imports";
    case Sections.DETAIL:
      // The detail route is valid only when an import id is provided by caller.
      return `/imports/${importId}/detail`;
    default:
      return "/imports";
  }
}

export function redirectToSection(
  router: AppRouterInstance,
  step: Sections,
  importId?: string,
) {
  router.push(getSectionPath(step, importId));
}
