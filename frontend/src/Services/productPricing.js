export const getProductMrp = (product) => {
  const mrp = Number(product?.mrp ?? product?.maximumRetailPrice ?? product?.price ?? 0);
  return Number.isFinite(mrp) ? mrp : 0;
};

export const getProductPrice = (product) => {
  const price = Number(product?.price ?? 0);
  return Number.isFinite(price) ? price : 0;
};

export const getDiscountPercent = (product) => {
  const mrp = getProductMrp(product);
  const price = getProductPrice(product);
  if (mrp <= 0 || price >= mrp) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
};

export const formatRupees = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
