import { createSlice } from "@reduxjs/toolkit";

// Load cart from localStorage (if exists)
// when this code runs for the first time? Yes, when the app initializes, it will check localStorage for any saved cart items and load them into the Redux state. This ensures that the user's cart persists across page reloads and browser sessions.
const cartItemsFromStorage = localStorage.getItem("cartItems")
  ? JSON.parse(localStorage.getItem("cartItems"))
  : [];

const cartSlice = createSlice({
  name: "cart",

  initialState: {
    cartItems: cartItemsFromStorage,
  },

  reducers: {

    // ===============================
    // ADD TO CART
    // ===============================
    addToCart: (state, action) => {
      const item = action.payload;

      // console.log("Adding to cart:", item); // Debug log to check the item being added
      const existItem = state.cartItems.find(
        x => x._id === item._id
      );

      if (existItem) {
        // If already exists → update quantity
        existItem.quantity = item.quantity;
      } else {
        state.cartItems.push(item);
      }

      localStorage.setItem(
        "cartItems",
        JSON.stringify(state.cartItems)
      );
    },

    // ===============================
    // REMOVE FROM CART
    // ===============================
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (x) => x._id !== action.payload
      );

      localStorage.setItem(
        "cartItems",
        JSON.stringify(state.cartItems)
      );
    },

    // ===============================
    // CLEAR CART
    // ===============================
    clearCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem("cartItems");
    },

    increaseQuantity: (state, action) => {
      const item = state.cartItems.find(
        x => x._id === action.payload
      );

      if (item) {
        // ✅ CHECK STOCK LIMIT
        if (item.quantity < item.stock) {
          item.quantity += 1;

          localStorage.setItem(
            "cartItems",
            JSON.stringify(state.cartItems)
          );
        }
      }
    }
    ,

    decreaseQuantity: (state, action) => {
      const item = state.cartItems.find(
        x => x._id === action.payload
      );

      if (item && item.quantity > 1) {
        item.quantity -= 1;

        // ✅ Save updated cart to localStorage
        localStorage.setItem(
          "cartItems",
          JSON.stringify(state.cartItems)
        );
      }
    }
  }
});

export const { addToCart, removeFromCart, clearCart, increaseQuantity, decreaseQuantity } =
  cartSlice.actions;

export default cartSlice.reducer;