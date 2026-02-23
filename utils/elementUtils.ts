import { Element, ELEMENT_BY_ID, TIER_NAMES } from "../constants/elements";

/** Normalize element name to URL-safe id (e.g. "Double Rainbow" -> "double-rainbow"). */
export function elementNameToId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Resize icon URL to given width (default 72). */
export function getIconUrl(
  iconUrl: string | null,
  size: number = 72,
): string | null {
  if (!iconUrl) return null;
  return iconUrl.replace(
    "/revision/latest",
    `/revision/latest/scale-to-width-down/${size}`,
  );
}

/** Look up element by id (e.g. "air", "double-rainbow"). */
export function getElementById(elementId: string): Element | null {
  return ELEMENT_BY_ID[elementId] ?? null;
}

/** Look up element by display name (e.g. "Air", "Double Rainbow"). */
export function getElementByName(name: string): Element | null {
  return getElementById(elementNameToId(name));
}

/** Human-readable tier label (e.g. "Starting Elements", "T1"). */
export function getTierDisplayText(tier: number): string {
  if (tier === 0) return "Start";
  if (tier === -1) return "Special";
  return TIER_NAMES[tier] ?? `T${tier}`;
}
