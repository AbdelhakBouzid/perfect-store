import { Link } from "react-router-dom";
import { toAbsoluteUploadUrl } from "../lib/config";
import { money } from "../lib/format";

export default function CartDrawer({
  isOpen,
  onClose,
  lines,
  count,
  totals,
  onIncrease,
  onDecrease,
  onRemove,
  onClear,
  onCheckout,
  checkoutLabel,
  emptyText,
  showCheckoutLink = false
}) {
  return (
    <aside className={`drawer ${isOpen ? "open" : ""}`} aria-hidden={!isOpen}>
      <div className="drawer-head">
        <div>
          <div className="drawer-title">Shopping Cart</div>
          <div className="small muted">{lines.length ? `Items: ${count}` : "Cart is empty"}</div>
        </div>
        <button className="btn ghost" type="button" onClick={onClose}>
          X
        </button>
      </div>

      <div className="drawer-body">
        {!lines.length ? (
          <div className="muted">{emptyText || "Your cart is empty."}</div>
        ) : (
          lines.map((line) => {
            const imageUrl = line.product.image_url ? toAbsoluteUploadUrl(line.product.image_url) : "";
            return (
              <div className="item" key={line.id}>
                <div className="item-top">
                  <div className="item-left">
                    <div className="cartthumb">
                      {imageUrl ? (
                        <img src={imageUrl} alt={line.product.name} />
                      ) : (
                        <div className="cartthumbFallback">{line.product.emoji || "Item"}</div>
                      )}
                    </div>
                    <div>
                      <div className="item-name">
                        {showCheckoutLink ? (
                          <Link className="item-link" to={`/product/${line.id}`}>
                            {line.product.name}
                          </Link>
                        ) : (
                          line.product.name
                        )}
                      </div>
                      <div className="small muted item-sub">
                        Unit price: {money(line.product.price)} MAD
                      </div>
                    </div>
                  </div>
                  <div>
                    <b>{money(Number(line.product.price) * line.qty)} MAD</b>
                  </div>
                </div>

                <div className="qty">
                  <button type="button" onClick={() => onDecrease(line.id)}>
                    -
                  </button>
                  <b>{line.qty}</b>
                  <button type="button" onClick={() => onIncrease(line.id)}>
                    +
                  </button>
                  <button className="btn ghost remove" type="button" onClick={() => onRemove(line.id)}>
                    Remove
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="drawer-foot">
        <div className="totals">
          <div className="row">
            <span>Subtotal</span>
            <b>{money(totals.subtotal)}</b>
            <span className="muted">MAD</span>
          </div>
          <div className="row">
            <span>Shipping</span>
            <b>{money(totals.shipping)}</b>
            <span className="muted">MAD</span>
          </div>
          <div className="row total">
            <span>Total</span>
            <b>{money(totals.total)}</b>
            <span className="muted">MAD</span>
          </div>
        </div>

        <button className="btn primary" type="button" onClick={onCheckout}>
          {checkoutLabel}
        </button>
        <button className="btn ghost" type="button" onClick={onClear}>
          Clear Cart
        </button>
        <div className="small muted">Cash on delivery.</div>
      </div>
    </aside>
  );
}

