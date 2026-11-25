export function calculateScrollProgress({ scrollTop = 0, scrollHeight = 0, clientHeight = 0 } = {}) {
  const top = Number(scrollTop);
  const totalHeight = Number(scrollHeight);
  const viewportHeight = Number(clientHeight);

  if (!Number.isFinite(top) || !Number.isFinite(totalHeight) || !Number.isFinite(viewportHeight)) {
    return 0;
  }

  const scrollableDistance = totalHeight - viewportHeight;
  if (scrollableDistance <= 0) {
    return 0;
  }

  const rawPercent = (top / scrollableDistance) * 100;
  return Math.min(100, Math.max(0, Number(rawPercent.toFixed(2))));
}
