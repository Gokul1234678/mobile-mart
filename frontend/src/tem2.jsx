import { useEffect, useState, useMemo } from "react";
import axiosInstance from "../../axios_instance";
import { toast } from "react-toastify";
import Pagination from "react-js-pagination";
import VideoLoader from "../../components/VideoLoader";

const Products = () => {

  // ==========================================
  // STATE
  // ==========================================
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  // Pagination
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 6;

  // ==========================================
  // FETCH PRODUCTS
  // ==========================================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axiosInstance.get("/api/products", {
          withCredentials: true// to send cookies for authentication
        });

        setProducts(data.products);

      } catch (err) {
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ==========================================
  // SEARCH FILTER
  // ==========================================
  // this will recompute filteredProducts only when products or search changes, improving performance
  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())// case-insensitive search
    );
  }, [products, search]);

  // ==========================================
  // PAGINATION LOGIC
  // ==========================================
  const indexOfLast = activePage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;

  const currentProducts = filteredProducts.slice(
    indexOfFirst,
    indexOfLast
  );

  // ==========================================
  // DELETE PRODUCT
  // ==========================================
  const deleteProduct = async (id) => {

    if (!window.confirm("Delete this product?")) return;

    try {
      await axiosInstance.delete(`/api/product/${id}`, {
        withCredentials: true
      });

      toast.success("Product deleted");

      setProducts(products.filter((p) => p._id !== id));

    } catch {
      toast.error("Delete failed");
    }
  };

  // ==========================================
  // LOADING UI
  // ==========================================
  if (loading) {
    return <VideoLoader />;
  }

  // ==========================================
  // UI
  // ==========================================
  return (
    <div className="container-fluid">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Products</h2>

        <button className="btn btn-success">
          + Add Product
        </button>
      </div>

      {/* 🔍 SEARCH */}
      <input
        type="text"
        placeholder="Search products..."
        className="form-control mb-3"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setActivePage(1); // reset page
        }}
      />

      {/* TABLE */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">

          <thead className="table-dark">
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
            {currentProducts.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  No products found
                </td>
              </tr>
            ) : (
              currentProducts.map((product, index) => (
                <tr key={product._id}>

                  {/* Index */}
                  <td>
                    {(activePage - 1) * itemsPerPage + index + 1}
                  </td>

                  {/* Image */}
                  <td>
                    <img
                      src={product.images?.[0]}
                      alt={product.name}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                        borderRadius: "6px"
                      }}
                    />
                  </td>

                  {/* Name */}
                  <td>{product.name}</td>

                  {/* Price */}
                  <td>₹{product.offerPrice}</td>

                  {/* Stock */}
                  <td>{product.quantity}</td>

                  {/* Status */}
                  <td>
                    {product.quantity > 0 ? (
                      <span className="badge bg-success">In Stock</span>
                    ) : (
                      <span className="badge bg-danger">Out of Stock</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td>
                    <button className="btn btn-sm btn-primary me-2">
                      Edit
                    </button>

                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteProduct(product._id)}
                    >
                      Delete
                    </button>
                  </td>

                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>

      {/* 📄 PAGINATION */}
      <div className="d-flex justify-content-center mt-4">

        <Pagination
          activePage={activePage}
          itemsCountPerPage={itemsPerPage}
          totalItemsCount={filteredProducts.length}
          onChange={(pageNumber) => setActivePage(pageNumber)}
          itemClass="page-item"
          linkClass="page-link"
          prevPageText="Prev"
          nextPageText="Next"
          firstPageText="First"
          lastPageText="Last"
        />

      </div>

    </div>
  );
};

export default Products;