app.get("/api/admin/dashboard", async (req, res) => {
  try {

    // 📊 Get counts for Totalproducts, Totalorders, Totalusers
    const totalProducts = await productModel.countDocuments();
    
    const totalOrders = await orderModel.countDocuments();

    const totalUsers = await userModel.countDocuments();

    // 💰 Calculate total revenue
    const orders = await orderModel.find();
    const totalRevenue = orders.reduce(
      (acc, order) => acc + order.totalPrice,
      0
    );

    // ❌ Out of stock products
    const outOfStock = await productModel.countDocuments({
      quantity: 0
    });

    res.status(200).json({
      success: true,
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      outOfStock
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});