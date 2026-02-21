import { useTranslation } from "react-i18next";
import { formatPrice } from "../../lib/format";
import { resolveProductImage } from "../../lib/productsApi";
import Button from "../ui/Button";

export default function ProductCard({ product, onAddToCart }) {
  const { t, i18n } = useTranslation();
  const imageUrl = resolveProductImage(product);
  const isOutOfStock = Number(product.stock) <= 0;

  return (
    <article className="surface-card overflow-hidden">
      <div className="relative h-36 w-full bg-slate-100 dark:bg-slate-800">
        {imageUrl ? (
          <img
            alt={product.name || t("products.cardFallback")}
            className="h-full w-full object-cover"
            src={imageUrl}
          />
        ) : (
          <div className="grid h-full place-items-center text-3xl">{product.emoji || "🛍️"}</div>
        )}
        <span className="absolute end-2 top-2 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow dark:bg-slate-900/90 dark:text-slate-200">
          {product.category}
        </span>
      </div>

      <div className="space-y-2.5 p-3.5">
        <h3 className="line-clamp-1 text-sm font-extrabold text-slate-900 dark:text-slate-100">{product.name}</h3>
        <p className="line-clamp-2 min-h-[2.5rem] text-xs leading-5 text-slate-500 dark:text-slate-400">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {formatPrice(product.price, i18n.language)} {t("common.currency")}
          </p>
          <span className="rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {isOutOfStock ? t("common.outOfStock") : `${product.stock}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button className="flex-1" size="sm" to={`/product/${product.id}`} variant="ghost">
            {t("actions.view")}
          </Button>
          <Button
            className="flex-1"
            disabled={isOutOfStock}
            onClick={() => onAddToCart(product.id)}
            size="sm"
            variant="primary"
          >
            {t("actions.addToCart")}
          </Button>
        </div>
      </div>
    </article>
  );
}
