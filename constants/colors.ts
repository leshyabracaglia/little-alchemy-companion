export const colors = {
  background: "#1a1a2e",
  surface: "#252540",
  surfaceLight: "#2f2f4a",
  primary: "#d4a853",
  primaryDark: "#b8923f",
  text: "#f0f0f0",
  textSecondary: "#888899",
  textMuted: "#666677",
  border: "#3a3a5a",
  success: "#4ade80",
  tier0: "#d4a853", // Starting
  tierSpecial: "#a855f7", // Special (Time)
  tier1: "#60a5fa",
  tier2: "#34d399",
  tier3: "#fbbf24",
  tier4: "#f472b6",
  tier5: "#a78bfa",
};

export const getTierColor = (tier: number): string => {
  if (tier === -1) return colors.tierSpecial;
  if (tier === 0) return colors.tier0;
  const tierColors = [
    colors.tier1,
    colors.tier2,
    colors.tier3,
    colors.tier4,
    colors.tier5,
  ];
  return tierColors[(tier - 1) % tierColors.length];
};
