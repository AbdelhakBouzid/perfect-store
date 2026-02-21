import { useTranslation } from "react-i18next";
import { formatPrice } from "../../lib/format";
import { resolveProductImage } from "../../lib/productsApi";
import Button from "../ui/Button";

export default function ProductCard({ product, onAddToCart }) {
  const { t, i18n } = useTranslation();
  const imageUrl = resolveProductImage(product);
  const isOutOfStock = Number(product.stock) <= 0;

  return (
    <article className="glass-card overflow-hidden">
      <div className="relative h-44 w-full bg-black/20">
        {imageUrl ? (
          <img
            alt={product.name || t("products.cardFallback")}
            className="h-full w-full object-cover"
            src={imageUrl}
          />
        ) : (
          <div className="grid h-full place-items-center text-4xl">{product.emoji || "🛍️"}</div>
        )}
        <span className="absolute end-3 top-3 rounded-full bg-black/45 px-3 py-1 text-xs font-semibold text-white">
          {product.category}
        </span>
      </div>

      <div className="space-y-3 p-4">
        <h3 className="line-clamp-1 text-lg font-semibold text-white">{product.name}</h3>
        <p className="line-clamp-2 text-sm text-white/75">{product.description}</p>

        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-white">
            {formatPrice(product.price, i18n.language)} {t("common.currency")}
          </p>
          <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs text-white/80">
            {isOutOfStock ? t("common.outOfStock") : `${product.stock}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button className="flex-1" to={`/product/${product.id}`} variant="ghost">
            {t("actions.view")}
          </Button>
          <Button
            className="flex-1"
            disabled={isOutOfStock}
            onClick={() => onAddToCart(product.id)}
            variant="primary"
          >
            {t("actions.addToCart")}
          </Button>
        </div>
      </div>
    </article>
  );
}
