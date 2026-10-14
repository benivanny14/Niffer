"use client";

import { useState } from "react";
import { categories as fallbackCategories, type Category, type Product } from "@/lib/data/catalog";
import { formatTsh } from "@/lib/format";
import {
  apiDelete,
  apiForm,
  apiGet,
  apiPatch,
  apiPost,
  errorMessage,
} from "@/lib/api";
import { useAsync } from "@/lib/use-async";
import { CheckIcon, CloseIcon, TrashIcon } from "@/components/ui/icons";
import { ProductImage } from "@/components/media/ProductImage";

const field =
  "w-full rounded-xl border border-cream-300 bg-surface px-3 py-2.5 text-sm text-ink-900 outline-none transition-colors focus:border-brand-500";

type Draft = {
  mode: "edit" | "create";
  slug: string;
  name: string;
  price: string;
  compareAt: string;
  category: string;
  stock: string;
  shortDescription: string;
  description: string;
  image: string;
  file: File | null;
};

const emptyDraft: Draft = {
  mode: "create",
  slug: "",
  name: "",
  price: "",
  compareAt: "",
  category: fallbackCategories[0]?.slug ?? "skincare",
  stock: "10",
  shortDescription: "",
  description: "",
  image: "",
  file: null,
};

/**
 * Meneja wa bidhaa (admin): orodha kutoka DB, ongeza / hariri / futa,
 * pakia picha — mabadiliko yanaonekana mara moja kwenye duka lote.
 */
export function ProductManager() {
  const [categoryFilter, setCategoryFilter] = useState("zote");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [stockError, setStockError] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [categorySaving, setCategorySaving] = useState(false);

  const categoryResource = useAsync<Category[]>("admin-categories", async () => {
    const res = await apiGet<{ ok: boolean; categories: Category[] }>("/api/categories");
    return res.categories;
  });
  const categoryOptions = categoryResource.data ?? fallbackCategories;

  const { data, loading, error, refresh } = useAsync<Product[]>(
    "admin-products",
    async () => {
      const res = await apiGet<{ ok: boolean; products: Product[] }>(
        "/api/products",
      );
      return res.products;
    },
    { intervalMs: 60_000 },
  );

  const products = data ?? [];
  const filtered = products.filter(
    (p) => categoryFilter === "zote" || p.category === categoryFilter,
  );

  async function addCategory() {
    if (categorySaving) return;
    setCategorySaving(true);
    setCategoryError("");
    try {
      const result = await apiPost<{ ok: boolean; category: Category }>("/api/categories", {
        name: categoryName,
        description: categoryDescription,
      });
      setCategoryName("");
      setCategoryDescription("");
      categoryResource.refresh();
      setCategoryFilter(result.category.slug);
      flash(`Category ${result.category.name} added`);
    } catch (err) {
      setCategoryError(errorMessage(err));
    } finally {
      setCategorySaving(false);
    }
  }

  function openEdit(product: Product) {
    setFormError("");
    setDraft({
      mode: "edit",
      slug: product.slug,
      name: product.name,
      price: String(product.priceTsh),
      compareAt: product.compareAtTsh ? String(product.compareAtTsh) : "",
      category: product.category,
      stock: String(product.stock),
      shortDescription: product.shortDescription,
      description: product.description,
      image: product.image,
      file: null,
    });
  }

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2500);
  }

  async function quickStock(slug: string, qty: number) {
    setStockError("");
    try {
      await apiPatch(`/api/products/${slug}`, { stock: qty });
      refresh();
    } catch (err) {
      setStockError(errorMessage(err));
    }
  }

  async function save() {
    if (!draft || saving) return;
    const price = Math.round(Number(draft.price));
    if (draft.name.trim().length < 2) {
      setFormError("Product name is required.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setFormError("Enter a valid price.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      let slug = draft.slug;
      const payload = {
        name: draft.name,
        category: draft.category,
        priceTsh: price,
        compareAtTsh: draft.compareAt ? Math.round(Number(draft.compareAt)) : null,
        shortDescription: draft.shortDescription,
        description: draft.description,
        stock: Math.max(0, Math.floor(Number(draft.stock) || 0)),
      };

      if (draft.mode === "create") {
        const res = await apiPost<{ ok: boolean; product: Product }>(
          "/api/products",
          payload,
        );
        slug = res.product.slug;
      } else {
        await apiPatch(`/api/products/${draft.slug}`, payload);
      }

      if (draft.file) {
        const fd = new FormData();
        fd.append("file", draft.file);
        await apiForm(`/api/products/${slug}/image`, fd);
      }

      refresh();
      flash("Saved to the database");
      setDraft(null);
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove(product: Product) {
    const ok = window.confirm(
      `Delete "${product.name}"? Existing orders will remain, but its reviews will be removed.`,
    );
    if (!ok) return;
    try {
      await apiDelete(`/api/products/${product.slug}`);
      refresh();
      flash("Product deleted");
    } catch (err) {
      setStockError(errorMessage(err));
    }
  }

  return (
    <div>
      {/* Vyombo */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-ink-700">Category:</label>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-cream-300 bg-surface px-3 py-2 text-sm"
        >
          <option value="zote">All categories</option>
          {categoryOptions.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => {
            setFormError("");
            setDraft({ ...emptyDraft });
          }}
          className="btn-primary ml-auto px-4 py-2 text-xs"
        >
          + Add product
        </button>

        {notice ? (
          <span className="badge bg-success-100 text-success-600">
            <CheckIcon className="h-3 w-3" /> {notice}
          </span>
        ) : null}
        {stockError ? (
          <span className="text-xs text-danger-600">{stockError}</span>
        ) : null}
      </div>

      <details className="card mt-4 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-ink-800">
          + Add a category
        </summary>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink-700">Category name</span>
            <input
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              maxLength={60}
              className={field}
              placeholder="e.g. Fragrance"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink-700">Short description (optional)</span>
            <input
              value={categoryDescription}
              onChange={(event) => setCategoryDescription(event.target.value)}
              maxLength={240}
              className={field}
              placeholder="Fragrance and body mists"
            />
          </label>
          {categoryError ? <p className="text-sm text-danger-600 sm:col-span-2">{categoryError}</p> : null}
          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={() => void addCategory()}
              disabled={categorySaving || categoryName.trim().length < 2}
              className="btn-primary px-4 py-2 text-sm disabled:opacity-60"
            >
              {categorySaving ? "Adding…" : "Add category"}
            </button>
          </div>
        </div>
      </details>

      {/* Orodha */}
      <div className="card mt-6 overflow-x-auto">
        {loading ? (
          <div className="space-y-3 p-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-cream-200" />
            ))}
          </div>
        ) : error ? (
          <p className="p-5 text-sm text-danger-600">{error}</p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-cream-300 text-xs uppercase tracking-wide text-ink-400">
                <th className="px-5 py-3 font-semibold">Product</th>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Price</th>
                <th className="px-5 py-3 font-semibold">Stock</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
                const low = product.stock <= 10;
                return (
                  <tr
                    key={product.slug}
                    className="border-b border-cream-200 last:border-0"
                  >
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-3">
                        <ProductImage
                          src={product.image}
                          alt={product.imageAlt}
                          className="h-10 w-10 shrink-0 rounded-lg border border-cream-300 object-cover"
                        />
                        <span className="min-w-0">
                          <span className="block font-medium text-ink-900">
                            {product.name}
                          </span>
                          <span className="block text-xs text-ink-400">
                            {product.slug}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td className="px-5 py-3 text-ink-700">
                      {categoryOptions.find((c) => c.slug === product.category)?.name ??
                        product.category}
                    </td>
                    <td className="px-5 py-3 text-ink-700">
                      {formatTsh(product.priceTsh)}
                    </td>
                    <td className="px-5 py-3">
                      <input
                        type="number"
                        min={0}
                        defaultValue={product.stock}
                        key={`${product.slug}-${product.stock}`}
                        onBlur={(e) => {
                          const v = Math.max(0, Number(e.target.value) || 0);
                          if (v !== product.stock) void quickStock(product.slug, v);
                        }}
                        className="w-20 rounded-lg border border-cream-300 px-2 py-1 text-sm"
                        aria-label={`Stock for ${product.name}`}
                      />
                      {low ? (
                        <span className="badge ml-2 bg-warning-100 text-warning-600">
                          ndogo
                        </span>
                      ) : null}
                    </td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(product)}
                          className="rounded-lg border border-cream-300 px-3 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:border-brand-300 hover:text-accent"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void remove(product)}
                          aria-label={`Delete ${product.name}`}
                          className="rounded-lg border border-cream-300 p-1.5 text-ink-400 transition-colors hover:border-danger-600 hover:text-danger-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="mt-3 text-xs text-ink-400">
        Price, name and image changes are saved to the server database and
        appear throughout the store right away.
      </p>

      {/* Modal ya kuhariri / kuongeza */}
      {draft ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
          <div className="card mt-10 w-full max-w-2xl p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl text-ink-900">
                {draft.mode === "create" ? "Add product" : "Edit product"}
              </h3>
              <button
                type="button"
                onClick={() => setDraft(null)}
                aria-label="Close"
                className="rounded-full p-2 text-ink-500 hover:bg-cream-200"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm sm:col-span-2">
                <span className="mb-1.5 block font-medium text-ink-700">
                  Product name *
                </span>
                <input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className={field}
                  placeholder="e.g. Radiance Vitamin C Serum"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-ink-700">
                  Price (TSh) *
                </span>
                <input
                  type="number"
                  min={0}
                  value={draft.price}
                  onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                  className={field}
                  inputMode="numeric"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-ink-700">
                  Original price (optional)
                </span>
                <input
                  type="number"
                  min={0}
                  value={draft.compareAt}
                  onChange={(e) =>
                    setDraft({ ...draft, compareAt: e.target.value })
                  }
                  className={field}
                  inputMode="numeric"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-ink-700">
                  Category
                </span>
                <select
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  className={field}
                >
                  {categoryOptions.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-ink-700">
                  Stock
                </span>
                <input
                  type="number"
                  min={0}
                  value={draft.stock}
                  onChange={(e) => setDraft({ ...draft, stock: e.target.value })}
                  className={field}
                  inputMode="numeric"
                />
              </label>

              <label className="block text-sm sm:col-span-2">
                <span className="mb-1.5 block font-medium text-ink-700">
                  Short description
                </span>
                <input
                  value={draft.shortDescription}
                  onChange={(e) =>
                    setDraft({ ...draft, shortDescription: e.target.value })
                  }
                  className={field}
                  placeholder="A short product summary"
                />
              </label>

              <label className="block text-sm sm:col-span-2">
                <span className="mb-1.5 block font-medium text-ink-700">
                  Full description
                </span>
                <textarea
                  value={draft.description}
                  onChange={(e) =>
                    setDraft({ ...draft, description: e.target.value })
                  }
                  rows={4}
                  className={field}
                />
              </label>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-ink-700">
                  Image
                </label>
                <div className="flex items-center gap-4">
                  <ProductImage
                    src={
                      draft.file ? URL.createObjectURL(draft.file) : draft.image
                    }
                    alt={
                      draft.file
                        ? `Preview of ${draft.file.name}`
                        : `Preview of ${draft.name || "product image"}`
                    }
                    className="h-16 w-16 rounded-xl border border-cream-300 object-cover"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    aria-label="Product image"
                    onChange={(e) =>
                      setDraft({ ...draft, file: e.target.files?.[0] ?? null })
                    }
                    className="text-sm text-ink-500 file:mr-3 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-accent"
                  />
                </div>
                <p className="mt-1 text-xs text-ink-400">
                  PNG, JPG, WebP or AVIF ? up to 12 MB. Leave blank to add an image later.
                </p>
              </div>
            </div>

            {formError ? (
              <p className="mt-4 rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger-600">
                {formError}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="btn-outline px-5 py-2.5 text-sm"
              >
                    Cancel
              </button>
              <button
                type="button"
                onClick={() => void save()}
                disabled={saving}
                className="btn-primary px-5 py-2.5 text-sm disabled:opacity-60"
              >
                {saving ? "Saving?" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
