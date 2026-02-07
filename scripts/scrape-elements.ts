import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import { fileURLToPath } from "url";

// ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Recipe {
  ingredients: [string, string];
}

interface Element {
  id: string;
  name: string;
  recipes: Recipe[];
  tier: number;
  iconUrl: string | null;
}

const WIKI_URL =
  "https://little-alchemy.fandom.com/wiki/Elements_(Little_Alchemy_2)";

async function fetchPage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
      res.on("error", reject);
    });
  });
}

async function downloadIcon(
  url: string,
  filename: string,
  iconsDir: string
): Promise<boolean> {
  return new Promise((resolve) => {
    const filePath = path.join(iconsDir, filename);

    // Handle protocol-relative URLs
    let fullUrl = url.startsWith("//") ? `https:${url}` : url;

    // Get the full-size SVG instead of scaled version
    fullUrl = fullUrl.replace(/\/scale-to-width-down\/\d+/, "");

    https
      .get(fullUrl, (res) => {
        // Follow redirects
        if (res.statusCode === 301 || res.statusCode === 302) {
          const redirectUrl = res.headers.location;
          if (redirectUrl) {
            downloadIcon(redirectUrl, filename, iconsDir).then(resolve);
            return;
          }
        }

        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const buffer = Buffer.concat(chunks);
          fs.writeFileSync(filePath, buffer);
          resolve(true);
        });
        res.on("error", () => resolve(false));
      })
      .on("error", () => resolve(false));
  });
}

function toId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getTierFromHeading(headingText: string): number {
  const lower = headingText.toLowerCase();
  if (lower.includes("starting")) return 0;
  if (lower.includes("special")) return -1;
  const match = lower.match(/tier\s*(\d+)/);
  if (match) return parseInt(match[1], 10);
  return 0;
}

async function scrapeElements(): Promise<Element[]> {
  console.log("Fetching wiki page...");
  const html = await fetchPage(WIKI_URL);
  const $ = cheerio.load(html);

  const elements: Element[] = [];
  let currentTier = 0;

  // Find all h3 headings (tier sections) and their associated tables
  $("h3").each((_, heading) => {
    const headingText = $(heading).find(".mw-headline").text().trim();
    if (!headingText) return;

    currentTier = getTierFromHeading(headingText);
    console.log(`Processing: ${headingText} (tier ${currentTier})`);

    // Find the next table after this heading
    let table = $(heading).nextAll("table.list-table").first();
    if (table.length === 0) {
      // Try looking in parent and then next sibling
      table = $(heading).parent().nextAll("table.list-table").first();
    }
    if (table.length === 0) {
      table = $(heading).nextUntil("h3", "table.list-table").first();
    }

    if (table.length === 0) {
      console.log(`  No table found for ${headingText}`);
      return;
    }

    // Parse each row in the table
    table.find("tr").each((_, row) => {
      const cells = $(row).find("td");
      if (cells.length < 2) return; // Skip header rows

      // First cell: element icon and name
      const firstCell = $(cells[0]);
      const nameLink = firstCell.find('a[title]').first();
      const name = nameLink.attr("title") || nameLink.text().trim();
      if (!name) return;

      // Get icon URL from data-src attribute
      const img = firstCell.find("img").first();
      let iconUrl = img.attr("data-src") || img.attr("src") || null;

      // Clean up to get full SVG URL
      if (iconUrl && !iconUrl.startsWith("data:")) {
        iconUrl = iconUrl.split("/revision/")[0] + "/revision/latest";
      } else {
        iconUrl = null;
      }

      // Second cell: recipes
      const secondCell = $(cells[1]);
      const recipes: Recipe[] = [];

      // Check if it's a starting element (no recipes)
      const cellText = secondCell.text().trim();
      if (!cellText.includes("Available from the start")) {
        // Parse recipe list items
        secondCell.find("li").each((_, li) => {
          // Find all <a> tags with title attribute (element names)
          const links = $(li).find("a[title]");
          if (links.length >= 2) {
            const ingredient1 = $(links[0]).attr("title") || $(links[0]).text().trim();
            const ingredient2 = $(links[1]).attr("title") || $(links[1]).text().trim();
            if (ingredient1 && ingredient2) {
              recipes.push({
                ingredients: [ingredient1, ingredient2] as [string, string],
              });
            }
          }
        });
      }

      const element: Element = {
        id: toId(name),
        name,
        recipes,
        tier: currentTier,
        iconUrl,
      };

      elements.push(element);
    });
  });

  console.log(`\nFound ${elements.length} elements total`);
  return elements;
}

async function downloadAllIcons(elements: Element[]): Promise<void> {
  const iconsDir = path.join(__dirname, "..", "constants", "icons");

  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  console.log("\nDownloading icons...");
  let downloaded = 0;
  let failed = 0;
  let skipped = 0;

  for (const element of elements) {
    if (element.iconUrl) {
      const filename = `${element.id}.svg`;
      const filePath = path.join(iconsDir, filename);

      // Skip if already downloaded
      if (fs.existsSync(filePath)) {
        skipped++;
        continue;
      }

      const success = await downloadIcon(element.iconUrl, filename, iconsDir);
      if (success) {
        downloaded++;
        process.stdout.write(`\r  Downloaded: ${downloaded}, Failed: ${failed}, Skipped: ${skipped}`);
      } else {
        failed++;
      }
      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 100));
    } else {
      skipped++;
    }
  }

  console.log(`\nIcons: ${downloaded} downloaded, ${failed} failed, ${skipped} skipped`);
}

function generateConstantsFile(elements: Element[]): void {
  const constantsDir = path.join(__dirname, "..", "constants");

  // Build RECIPES_USING lookup
  const recipesUsing: Record<string, Set<string>> = {};

  elements.forEach((element) => {
    element.recipes.forEach((recipe) => {
      recipe.ingredients.forEach((ingredient) => {
        const ingredientId = toId(ingredient);
        if (!recipesUsing[ingredientId]) {
          recipesUsing[ingredientId] = new Set();
        }
        recipesUsing[ingredientId].add(element.id);
      });
    });
  });

  // Convert sets to arrays for serialization
  const recipesUsingArrays: Record<string, string[]> = {};
  Object.entries(recipesUsing).forEach(([key, value]) => {
    recipesUsingArrays[key] = Array.from(value).sort();
  });

  // Sort elements by tier, then by name
  elements.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    return a.name.localeCompare(b.name);
  });

  const content = `// Auto-generated by scrape-elements.ts
// Do not edit manually

export interface Recipe {
  ingredients: [string, string];
}

export interface Element {
  id: string;
  name: string;
  recipes: Recipe[];
  tier: number;
  iconUrl: string | null;
}

export const ELEMENTS: Element[] = ${JSON.stringify(elements, null, 2)};

export const ELEMENT_BY_ID: Record<string, Element> = ELEMENTS.reduce(
  (acc, el) => ({ ...acc, [el.id]: el }),
  {} as Record<string, Element>
);

export const RECIPES_USING: Record<string, string[]> = ${JSON.stringify(recipesUsingArrays, null, 2)};

export const TOTAL_ELEMENTS = ${elements.length};

// Group elements by tier for display
export const ELEMENTS_BY_TIER: Record<number, Element[]> = ELEMENTS.reduce(
  (acc, el) => {
    if (!acc[el.tier]) acc[el.tier] = [];
    acc[el.tier].push(el);
    return acc;
  },
  {} as Record<number, Element[]>
);

export const TIER_NAMES: Record<number, string> = {
  0: "Starting Elements",
  [-1]: "Special Element",
  ${Array.from({ length: 15 }, (_, i) => `${i + 1}: "Tier ${i + 1}"`).join(",\n  ")}
};
`;

  fs.writeFileSync(path.join(constantsDir, "elements.ts"), content);
  console.log(`\nGenerated constants/elements.ts with ${elements.length} elements`);
}

async function main() {
  try {
    const elements = await scrapeElements();

    if (elements.length === 0) {
      console.error("No elements found! The wiki structure may have changed.");
      process.exit(1);
    }

    // Download icons
    await downloadAllIcons(elements);

    // Generate constants file
    generateConstantsFile(elements);

    console.log("\nDone!");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
