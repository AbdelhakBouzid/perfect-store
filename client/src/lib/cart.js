export function calcShipping(subtotal) {
  if (subtotal <= 0) return 0;
  return subtotal >= 600 ? 0 : 39;
}

export function buildCartLines(cart, products) {
  const productMap = new Map((products || []).map((product) => [Number(product.id), product]));

  return Object.entries(cart || {})
    .map(([idString, qty]) => {
      const id = Number(idString);
      const product = productMap.get(id);
      if (!product) return null;
      return { id, qty: Number(qty || 0), product };
    })
    .filter(Boolean);
}

export function calcTotals(lines) {
  const subtotal = (lines || []).reduce(
    (sum, line) => sum + Number(line.product.price || 0) * Number(line.qty || 0),
    0
  );

  const shipping = calcShipping(subtotal);
  return { subtotal, shipping, total: subtotal + shipping };
}

