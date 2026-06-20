/**
 * Supabase Seed Script
 *
 * Run once to populate the database with realistic demo data.
 *
 * BEFORE RUNNING:
 *  1. Add your Supabase service role key to .env.local:
 *       SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
 *     (find it in Supabase dashboard → Project Settings → API → service_role)
 *
 *  2. Run:
 *       npm run seed
 *
 * The service role key bypasses Row Level Security so the script can insert
 * data without being authenticated as an admin user.
 */

import { createClient } from "@supabase/supabase-js";

// ─── Config ──────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(`
❌  Missing environment variables.

Make sure your .env.local contains:
  VITE_SUPABASE_URL=...
  SUPABASE_SERVICE_ROLE_KEY=...

Then run:  npm run seed
`);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Pass --skip-images to store original URLs without re-uploading to Storage.
// Useful for a quick re-seed during development.
const SKIP_IMAGES = process.argv.includes("--skip-images");

// ─── Helpers ─────────────────────────────────────────────────────────────────

const toSlug = (name) =>
  name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const round2 = (n) => Math.round(n * 100) / 100;

/** Fetch JSON, throw on non-2xx */
async function getJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": "seed-script/1.0" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} → ${url}`);
  return res.json();
}

/**
 * Download an image from a URL and upload it to the `product-images` bucket.
 * Returns the Supabase public URL, or the original URL if upload fails.
 */
async function uploadImage(imageUrl, fileKey) {
  if (SKIP_IMAGES) return imageUrl;

  try {
    const res = await fetch(imageUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible)" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const ext = contentType.includes("webp")
      ? "webp"
      : contentType.includes("png")
      ? "png"
      : "jpg";

    const path = `seed/${fileKey}.${ext}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, buffer, { contentType, upsert: true });

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(path);

    return publicUrl;
  } catch (err) {
    console.warn(`    ⚠ Upload failed (using original URL): ${err.message}`);
    return imageUrl; // fallback — still works, just hosted externally
  }
}

/**
 * Compute compare_price (original / was-higher price) from a DummyJSON product.
 * DummyJSON `price` is already the discounted price; `discountPercentage` tells
 * us how much was taken off, so we reverse it to get the original.
 */
function computeComparePrice(price, discountPercentage) {
  if (!discountPercentage || discountPercentage < 2) return null;
  return round2(price / (1 - discountPercentage / 100));
}

// ─── Category list ────────────────────────────────────────────────────────────

const CATEGORY_NAMES = [
  "Smartphones",
  "Laptops",
  "Tablets",
  "Gaming",
  "Headphones",
  "Smart Watches",
  "Cameras",
  "Furniture",
  "Home Decor",
  "Men's Fashion",
  "Women's Fashion",
  "Shoes",
  "Beauty",
  "Sports",
  "Accessories",
];

// ─── DummyJSON sources ────────────────────────────────────────────────────────
// Each entry fetches `limit` products from DummyJSON and maps them to one of
// our categories. Multiple entries can share the same target category.

const DUMMYJSON_SOURCES = [
  { source: "smartphones",        target: "Smartphones",     limit: 6 },
  { source: "laptops",            target: "Laptops",         limit: 5 },
  { source: "tablets",            target: "Tablets",         limit: 4 },
  { source: "mobile-accessories", target: "Headphones",      limit: 5 },
  { source: "mens-watches",       target: "Smart Watches",   limit: 4 },
  { source: "womens-watches",     target: "Smart Watches",   limit: 3 },
  { source: "furniture",          target: "Furniture",       limit: 5 },
  { source: "home-decoration",    target: "Home Decor",      limit: 5 },
  { source: "mens-shirts",        target: "Men's Fashion",   limit: 4 },
  { source: "womens-dresses",     target: "Women's Fashion", limit: 4 },
  { source: "mens-shoes",         target: "Shoes",           limit: 3 },
  { source: "womens-shoes",       target: "Shoes",           limit: 3 },
  { source: "beauty",             target: "Beauty",          limit: 3 },
  { source: "skin-care",          target: "Beauty",          limit: 3 },
  { source: "sports-accessories", target: "Sports",          limit: 5 },
  { source: "sunglasses",         target: "Accessories",     limit: 3 },
  { source: "womens-jewellery",   target: "Accessories",     limit: 3 },
];

// ─── Custom products (categories not covered by DummyJSON) ───────────────────

const CUSTOM_PRODUCTS = [
  // ── Gaming ────────────────────────────────────────────────────────────────
  {
    category: "Gaming",
    name: "PlayStation 5 Console",
    description:
      "Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with haptic feedback, adaptive triggers and 3D Audio. Play amazing PlayStation games on the world's most powerful gaming console.",
    price: 499.99,
    compare_price: 549.99,
    stock: 18,
    imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&q=80",
  },
  {
    category: "Gaming",
    name: "Xbox Series X",
    description:
      "The most powerful Xbox ever. Play thousands of titles from four generations of Xbox. 12 teraflops of processing power, DirectX ray tracing, a custom NVMe SSD, and 4K gaming at up to 120 FPS.",
    price: 499.99,
    compare_price: null,
    stock: 22,
    imageUrl: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=600&q=80",
  },
  {
    category: "Gaming",
    name: "ASUS ROG Strix G16 Gaming Laptop",
    description:
      "AMD Ryzen 9 7945HX, NVIDIA GeForce RTX 4080, 32GB DDR5 RAM, 1TB PCIe 4.0 SSD, 16-inch 240Hz QHD display. Engineered for serious gamers who demand maximum performance.",
    price: 1399.99,
    compare_price: 1699.99,
    stock: 9,
    imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&q=80",
  },
  {
    category: "Gaming",
    name: "Nintendo Switch OLED Model",
    description:
      "Vibrant 7-inch OLED screen, enhanced audio, wide adjustable stand, 64GB internal storage, and a dock with a wired LAN port. Play at home on the TV or on-the-go in handheld mode.",
    price: 349.99,
    compare_price: 399.99,
    stock: 30,
    imageUrl: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600&q=80",
  },
  {
    category: "Gaming",
    name: "Razer DeathAdder V3 Hyperspeed",
    description:
      "Ultra-lightweight wireless gaming mouse at just 63g. Razer HyperSpeed Wireless technology, Focus Pro 30K Optical Sensor, and 90-hour battery life for non-stop gaming sessions.",
    price: 79.99,
    compare_price: 99.99,
    stock: 55,
    imageUrl: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&q=80",
  },

  // ── Cameras ───────────────────────────────────────────────────────────────
  {
    category: "Cameras",
    name: "Canon EOS R5 Mirrorless Camera",
    description:
      "45MP full-frame CMOS sensor, 8K RAW internal video recording, up to 20fps continuous shooting, and in-body image stabilization up to 8 stops. The definitive professional hybrid camera.",
    price: 3799.99,
    compare_price: 3999.99,
    stock: 5,
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80",
  },
  {
    category: "Cameras",
    name: "Sony Alpha A7 IV Full-Frame",
    description:
      "33MP full-frame BSI CMOS sensor, 4K 60p video, 10fps continuous shooting, real-time Eye AF and Animal AF. Built for hybrid creators who demand professional stills and cinematic video.",
    price: 2499.99,
    compare_price: 2799.99,
    stock: 8,
    imageUrl: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=80",
  },
  {
    category: "Cameras",
    name: "Nikon Z6 III Mirrorless",
    description:
      "24.5MP partially stacked CMOS sensor, 6K ProRes RAW N video, 20fps blackout-free burst shooting. Exceptional low-light performance with ISO 64-64000 expandable to ISO 204800.",
    price: 1999.99,
    compare_price: 2299.99,
    stock: 10,
    imageUrl: "https://images.unsplash.com/photo-1548685983-1ca25a1cad17?w=600&q=80",
  },
  {
    category: "Cameras",
    name: "Fujifilm X-T5 Mirrorless Camera",
    description:
      "40.2MP X-Trans CMOS 5 HR sensor, Film Simulation modes, 7.0-stop IBIS, compact retro body. Delivers stunning resolution and color science in a lightweight, travel-friendly package.",
    price: 1699.99,
    compare_price: null,
    stock: 14,
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80",
  },
  {
    category: "Cameras",
    name: "GoPro HERO12 Black",
    description:
      "5.3K video at 60fps, HyperSmooth 6.0 stabilization, waterproof to 10m without a housing. Capture your adventures with stunning detail and rock-solid stability.",
    price: 399.99,
    compare_price: 449.99,
    stock: 40,
    imageUrl: "https://images.unsplash.com/photo-1611462985358-7b80e185bda8?w=600&q=80",
  },
];

// ─── Main seed function ───────────────────────────────────────────────────────

async function seed() {
  console.log("\n🌱  Starting database seed…\n");

  // ── Step 1: Clear existing data ──────────────────────────────────────────
  console.log("🗑   Clearing existing products and categories…");

  // Delete products first (FK constraint: products.category_id → categories.id)
  const { error: delProdErr } = await supabase
    .from("products")
    .delete()
    .not("id", "is", null); // delete all rows

  if (delProdErr) {
    console.error("Failed to clear products:", delProdErr.message);
    process.exit(1);
  }

  const { error: delCatErr } = await supabase
    .from("categories")
    .delete()
    .not("id", "is", null);

  if (delCatErr) {
    console.error("Failed to clear categories:", delCatErr.message);
    process.exit(1);
  }

  console.log("  ✓ Cleared\n");

  // ── Step 2: Insert categories ────────────────────────────────────────────
  console.log("📁  Inserting categories…");

  const { data: insertedCats, error: catErr } = await supabase
    .from("categories")
    .insert(CATEGORY_NAMES.map((name) => ({ name, slug: toSlug(name) })))
    .select("id, name");

  if (catErr) {
    console.error("Category insert failed:", catErr.message);
    process.exit(1);
  }

  // Build a lookup: categoryName → UUID
  const catMap = Object.fromEntries(insertedCats.map((c) => [c.name, c.id]));
  console.log(`  ✓ ${insertedCats.length} categories created\n`);

  // ── Step 3: Collect product data ─────────────────────────────────────────
  const allProducts = [];

  // 3a. Fetch from DummyJSON
  for (const { source, target, limit } of DUMMYJSON_SOURCES) {
    process.stdout.write(`📦  Fetching ${limit} from DummyJSON/${source} → "${target}"… `);
    try {
      const { products } = await getJson(
        `https://dummyjson.com/products/category/${source}?limit=${limit}&select=id,title,description,price,discountPercentage,stock,images,thumbnail`
      );

      for (const p of products) {
        allProducts.push({
          category: target,
          name: p.title,
          description: p.description || "",
          price: round2(p.price),
          compare_price: computeComparePrice(p.price, p.discountPercentage),
          stock: p.stock ?? 30,
          imageUrl: p.images?.[0] || p.thumbnail,
        });
      }
      console.log(`✓ (${products.length})`);
    } catch (err) {
      console.log(`⚠ skipped — ${err.message}`);
    }
  }

  // 3b. Add custom products
  allProducts.push(...CUSTOM_PRODUCTS);

  console.log(
    `\n  Total products to insert: ${allProducts.length}` +
      (SKIP_IMAGES ? "  (--skip-images: using original URLs)\n" : "\n")
  );

  // ── Step 4: Upload images + insert products ───────────────────────────────
  console.log("⬆   Uploading images and inserting products…\n");

  let inserted = 0;
  let failed = 0;
  const usedSlugs = new Set();

  for (let i = 0; i < allProducts.length; i++) {
    const p = allProducts[i];
    const category_id = catMap[p.category];

    if (!category_id) {
      console.warn(`  ⚠ Unknown category "${p.category}" — skipping "${p.name}"`);
      failed++;
      continue;
    }

    // Generate a unique slug
    let baseSlug = toSlug(p.name);
    let finalSlug = baseSlug;
    let attempt = 1;
    while (usedSlugs.has(finalSlug)) {
      finalSlug = `${baseSlug}-${attempt++}`;
    }
    usedSlugs.add(finalSlug);

    // Upload the image
    const fileKey = `${finalSlug}-${i}`;
    process.stdout.write(
      `  [${String(i + 1).padStart(2)}/${allProducts.length}] ${p.name.slice(0, 50).padEnd(50)} `
    );

    const storedUrl = await uploadImage(p.imageUrl, fileKey);

    // Insert the product row
    const { error } = await supabase.from("products").insert({
      name: p.name,
      slug: finalSlug,
      description: p.description,
      price: p.price,
      compare_price: p.compare_price,
      stock: p.stock,
      category_id,
      images: storedUrl ? [storedUrl] : [],
      is_active: true,
    });

    if (error) {
      console.log(`✗ ${error.message}`);
      failed++;
    } else {
      console.log("✓");
      inserted++;
    }

    // Small pause to avoid overwhelming Supabase Storage rate limits
    if (!SKIP_IMAGES && i % 5 === 4) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  // ── Done ─────────────────────────────────────────────────────────────────
  console.log(`
✅  Seed complete!
    ${inserted} products inserted
    ${failed}  failed / skipped
    ${insertedCats.length} categories created
`);
}

seed().catch((err) => {
  console.error("\n❌  Seed crashed:", err);
  process.exit(1);
});
