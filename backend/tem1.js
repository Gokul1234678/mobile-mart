// ======================================================
// 📦 FETCH ALL ORDERS
// ======================================================
const orders = await orderModel.find();


// ======================================================
// 💰 CALCULATE REVENUE (DELIVERED ORDERS ONLY)
// ======================================================
// Only delivered orders count as completed revenue

const totalRevenue = orders.reduce((acc, order) => {

  // Add revenue ONLY if order delivered
  if (order.orderStatus === "delivered") {
    return acc + order.totalPrice;
  }

  return acc;

}, 0);


// ======================================================
// ❌ CANCELLED ORDERS COUNT
// ======================================================
const cancelledOrders = orders.filter(
  order => order.orderStatus === "cancelled"
).length;