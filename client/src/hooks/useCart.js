import { useMemo } from "react";
import useLocalStorage from "./useLocalStorage";

export default function useCart(storageKey) {
  const [cart, setCart] = useLocalStorage(storageKey, {});

  const count = useMemo(
    () => Object.values(cart).reduce((sum, qty) => sum + Number(qty || 0), 0),
    [cart]
  );

  function addItem(productId) {
    const id = Number(productId);
    setCart((prev) => {
      const next = { ...prev };
      next[id] = (Number(next[id]) || 0) + 1;
      return next;
    });
  }

  function changeQty(productId, delta) {
    const id = Number(productId);
    setCart((prev) => {
      const next = { ...prev };
      const updated = (Number(next[id]) || 0) + Number(delta || 0);
      if (updated <= 0) delete next[id];
      else next[id] = updated;
      return next;
    });
  }

  function removeItem(productId) {
    const id = Number(productId);
    setCart((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function clearCart() {
    setCart({});
  }

  return { cart, count, setCart, addItem, changeQty, removeItem, clearCart };
}

