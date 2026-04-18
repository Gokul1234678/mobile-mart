import { useEffect, useState, useMemo } from "react";
import axiosInstance from "../../axios_instance";
import { toast } from "react-toastify";
import Pagination from "react-js-pagination";
import { useNavigate } from "react-router-dom";

import VideoLoader from "../../components/VideoLoader";

import "../../assets/styles/AdminProducts.css";

// =============================================
// Self-contained styles — matches admin theme
// Navy sidebar (#2b3643) + orange (#ff5722) accents
// =============================================

// =============================================
// SVG ICON COMPONENTS — inline, no library needed
// =============================================

/* Pencil icon for Edit button */
const IconEdit = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

/* Trash icon for Delete button */
const IconDelete = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

// =============================================
// MAIN COMPONENT
// =============================================
const Products = () => {
  const navigate = useNavigate();
  // ==========================================
  // STATE
  // ==========================================
  const [products, setProducts] = useState([]); // all products from API
  const [loading, setLoading] = useState(true); // show loader while fetching

  const [search, setSearch] = useState(""); // search input value

  // Pagination — current active page number
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 6; // products shown per page

  // ==========================================
  // FETCH PRODUCTS
  // GET /api/products — loads all products on mount
  // ==========================================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axiosInstance.get("/api/products", {
          withCredentials: true // to send cookies for authentication
        });
        setProducts(data.products);
      } catch (err) {
        toast.error("Failed to load products");
      } finally {
        setLoading(false); // hide loader regardless of result
      }
    };

    fetchProducts();
  }, []);

  // ==========================================
  // SEARCH FILTER
  // useMemo recomputes filteredProducts only when products or search changes
  // improving performance — avoids re-filtering on every render
  // ==========================================
  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) // case-insensitive search
    );
  }, [products, search]);

  // ==========================================
  // PAGINATION LOGIC
  // Slice the filtered array to show only current page items
  // ==========================================
  const indexOfLast = activePage * itemsPerPage;       // last item index on this page
  const indexOfFirst = indexOfLast - itemsPerPage;       // first item index on this page

  const currentProducts = filteredProducts.slice(
    indexOfFirst,
    indexOfLast
  );

  // ==========================================
  // DELETE PRODUCT
  // DELETE /api/product/:id
  // Removes product from UI immediately after success (no refetch needed)
  // ==========================================
  const deleteProduct = async (id) => {

    if (!window.confirm("Delete this product?")) return; // user confirmation guard

    try {
      await axiosInstance.delete(`/api/product/${id}`,
        {
          withCredentials: true
        });

      toast.success("Product deleted");

      // Filter out deleted product from local state — avoids refetch
      setProducts(products.filter((p) => p._id !== id));

    } catch {
      toast.error("Delete failed");
    }
  };

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (loading) {
    return <VideoLoader />;
  }

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <>

      <div className="prod-page">

        {/* ==========================================
            PAGE HEADER — title + Add Product button
        ========================================== */}
        <div className="prod-header">
          <h2 className="prod-title">Products</h2>

          {/* Add Product — green button (no handler yet, add onClick later) */}
          <button className="prod-add-btn" onClick={() => navigate("/admin/add-product")} >
            <span>＋</span>
            Add Product
          </button>
        </div>

        {/* ==========================================
            SEARCH BAR
            Resets to page 1 on every keystroke
        ========================================== */}
        <div className="prod-search-wrap">
          <span className="prod-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search products..."
            className="prod-search-input"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setActivePage(1); // reset to first page when search changes
            }}
          />
        </div>

        {/* Result count — shows how many products match the search */}
        <div className="prod-result-count">
          Showing <strong>{currentProducts.length}</strong> of{" "}
          <strong>{filteredProducts.length}</strong> products
        </div>

        {/* ==========================================
            PRODUCTS TABLE — wrapped in white card
        ========================================== */}
        <div className="prod-table-card">
          <table className="prod-table">

            {/* Table header — navy background */}
            <thead>
              <tr>
                <th>#</th>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {/* ---- Empty State ---- */}
              {currentProducts.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="prod-empty">
                      <div className="prod-empty-icon">📦</div>
                      <p>No products found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentProducts.map((product, index) => (
                  <tr key={product._id}>

                    {/* ---- Row Index ---- */}
                    <td>
                      <span className="prod-row-index">
                        {/* Correct index accounting for current page offset */}
                        {(activePage - 1) * itemsPerPage + index + 1}
                      </span>
                    </td>

                    {/* ---- Product Image ---- */}
                    <td>
                      <img
                        src={product.images?.[0]}
                        alt={product.name}
                        className="prod-img"
                      />
                    </td>

                    {/* ---- Product Name ---- */}
                    <td>
                      <span className="prod-name">{product.name}</span>
                    </td>

                    {/* ---- Offer Price ---- */}
                    <td>
                      <span className="prod-price">₹{product.offerPrice}</span>
                    </td>

                    {/* ---- Stock Quantity ---- */}
                    <td>
                      <span className="prod-stock">{product.quantity}</span>
                    </td>

                    {/* ---- Stock Status Badge ---- */}
                    <td>
                      {product.quantity > 0 ? (
                        /* Green badge — product is available */
                        <span className="prod-badge in-stock">
                          <span className="prod-badge-dot" />
                          In Stock
                        </span>
                      ) : (
                        /* Red badge — product unavailable */
                        <span className="prod-badge out-stock">
                          <span className="prod-badge-dot" />
                          Out of Stock
                        </span>
                      )}
                    </td>

                    {/* ---- Action Buttons ---- */}
                    <td>
                      <div className="prod-actions">

                        {/* Edit button — blue, pencil icon */}
                        <button onClick={() => navigate(`/admin/product/${ product._id }/edit`)} className="prod-action-btn edit">
                          <IconEdit />
                          Edit
                        </button>
                       
                        {/* Delete button — red, trash icon, calls deleteProduct */}
                        <button
                          className="prod-action-btn delete"
                          onClick={() => deleteProduct(product._id)}
                        >
                          <IconDelete />
                          Delete
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>

        {/* ==========================================
            PAGINATION
            react-js-pagination — styled with orange active page
        ========================================== */}
        <div className="prod-pagination">
          <Pagination
            activePage={activePage}
            itemsCountPerPage={itemsPerPage}
            totalItemsCount={filteredProducts.length}
            onChange={(pageNumber) => setActivePage(pageNumber)} // update page on click
            itemClass="page-item"
            linkClass="page-link"
            prevPageText="← Prev"
            nextPageText="Next →"
            firstPageText="First"
            lastPageText="Last"
          />
        </div>

      </div>
    </>
  );
};

export default Products;