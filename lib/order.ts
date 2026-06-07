export function resolveAvailableOrder(requestedOrder: number, existingOrders: number[]) {
  if (!existingOrders.includes(requestedOrder)) return requestedOrder;
  return Math.max(0, ...existingOrders) + 1;
}
