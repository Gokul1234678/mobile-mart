// Import helper functions from Redux Toolkit
// createSlice → creates reducer + actions easily
// createAsyncThunk → handles async logic (API calls)
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Axios instance (already configured with baseURL & cookies)
import axiosInstance from "../axios_instance";

/* ======================================================
   🔐 LOGIN ACTION (ASYNC)
   ====================================================== */

/*
  createAsyncThunk creates 3 action types automatically:
  1️⃣ loginUser.pending
  2️⃣ loginUser.fulfilled
  3️⃣ loginUser.rejected

  Syntax:
  createAsyncThunk("sliceName/actionName", asyncFunction)
*/
export const loginUser = createAsyncThunk(
  "user/login", // action name (used internally by Redux)

  /*
    This async function runs when we dispatch loginUser()
    It receives:
    - { email, password } → data from the component
    - thunkAPI → helper object provided by Redux
  */
  async ({ email, password }, thunkAPI) => {
    try {
      /*
        Call backend login API
        POST /api/login
        Body: { email, password }

        withCredentials: true
        → VERY IMPORTANT
        → This tells the browser: “Accept cookies from backend”
        → Allows browser to store httpOnly cookie (JWT)

      */
      const res = await axiosInstance.post(
        "/api/login",
        { email, password },
        { withCredentials: true }
      );

      /*
        If login is successful,
        backend sends:
        {
          success: true,
          user: { id, name, email }
        }

        Whatever we RETURN here becomes:
        action.payload inside fulfilled reducer
      */
      return res.data.user;
    } catch (err) {
      console.log("backend message ", err.response.data);

      // console.log("full error ",err);
      if (err.response && err.response.data) {
        console.log("backend message ", err.response.data.message);
      }
      else {
        console.log("unknown error message ", err.message);
      }

      /*
        If login fails (wrong password / email),
        backend sends error message

        rejectWithValue():
        → sends custom error payload to rejected reducer
      */
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Login failed"
      );
    }
  }
);

/* ======================================================
   🔓 LOGOUT ACTION (ASYNC)
   ====================================================== */

export const logoutUser = createAsyncThunk(
  "user/logout",
  async (_, thunkAPI) => {
    try {
      await axiosInstance.get("/api/logout", {
        withCredentials: true
      });

      return true; // success flag
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Logout failed"
      );
    }
  }
);


/* ======================================================
   👤 USER SLICE
   ====================================================== */

const userSlice = createSlice({
  // Slice name (used in Redux DevTools)
  name: "user",

  /*
    Initial state of user slice
    This defines how data looks before login
  */
  initialState: {
    user: null,             // Will store user object after login
    loading: false,         // True while API call is running
    error: null,            // Stores login error message
    isAuthenticated: false, // True after successful login
  },

  /*
    Synchronous reducers
    (No API calls here)
  */
  reducers: {
    /*
      Logout action
      Clears user data from Redux store
      (Backend cookie removal will be handled separately)
    */
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
  },

  /*
    extraReducers handle async actions
    These reducers respond to:
    - pending (⏳ Started)
    - fulfilled (✅ Succeeded)
    - rejected (❌ Failed)
    
    What is builder?
        extraReducers: (builder) => {
        Means:
          “Give me a tool that lets me react to different async events”

          Think of builder like a listener:

          when login starts → do something

          when login succeeds → do something

          when login fails → do something
  */
  extraReducers: (builder) => {
    builder

      /* --------------------
         🔄 LOGIN START
         -------------------- */
      .addCase(loginUser.pending, (state) => {
        state.loading = true;   // show loader in UI
        state.error = null;     // clear old errors
      })

      /* --------------------
         ✅ LOGIN SUCCESS
         -------------------- */
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;          // stop loader
        state.user = action.payload;    // save user data
        state.isAuthenticated = true;   // mark user as logged in
      })

      /* --------------------
         ❌ LOGIN FAILED
         -------------------- */
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;          // stop loader
        state.error = action.payload;   // store error message
      })

      /* --------------------
        🔓 LOGOUT SUCCESS
      -------------------- */
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })

  },
});

/*
  Export logout action
  Used like: dispatch(logout())
*/
export const { logout } = userSlice.actions;

/*
  Export reducer
  Used in store.js
*/
export default userSlice.reducer;
