import React, { useEffect, useState } from "react";
import axiosInstance from "../../axios_instance";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";

const EditProduct = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  // ================= STATE =================
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    originalPrice: "",
    offerPrice: "",
    quantity: "",
    description: ""
  });

  const [specs, setSpecs] = useState({
    Display: "",
    Processor: "",
    Camera: "",
    Battery: "",
    Storage: "",
    RAM: ""
  });

  const [oldImages, setOldImages] = useState([]); // existing images
  const [images, setImages] = useState([]);       // new images
  const [preview, setPreview] = useState([]);     // preview for new images

  const [loading, setLoading] = useState(false);

  // ================= FETCH PRODUCT =================
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Fetch the product data to pre-fill the form
        const { data } = await axiosInstance.get(`/api/product/${id}`);

        // Pre-fill form with existing product data
        const p = data.product;

        setFormData({
          name: p.name,
          brand: p.brand,
          originalPrice: p.originalPrice,
          offerPrice: p.offerPrice,
          quantity: p.quantity,
          description: p.description
        });


        setSpecs(p.specifications || {});
        setOldImages(p.images || []);

      } catch {
        toast.error("Failed to load product");
      }
    };

    fetchProduct();
  }, [id]);

  // ================= HANDLERS =================
  const handleChange = (e) => {// it is used for basic info fields, not specifications
    //a single handler for all basic info fields (name, brand, price, etc.)
    //it updates the formData state based on the input's name attribute
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // it is used for specifications fields (Display, Processor, etc.)
  // it updates the specs state based on the input's name attribute
  const handleSpecsChange = (e) => {
    setSpecs({ ...specs, [e.target.name]: e.target.value });
  };

  // it handles the change event when user selects new images
  // it updates the images state with the selected files and creates preview URLs for them
const handleImageChange = (e) => {

  // see ctreate product page for detailed comments on this function as the logic is the same, just added some extra validation for max 5 images including old and new images
  
  // Convert FileList to Array for easier manipulation
  const files = Array.from(e.target.files);

  // ==========================================
  // ❌ LIMIT ONLY PER UPLOAD (MAX 5)
  // ==========================================
  if (files.length > 5) {
    toast.error("You can upload maximum 5 images at a time");
    return;
  }

  // ==========================================
  // 🖼 IMAGE TYPE VALIDATION
  // ==========================================
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  const validExtensions = ["jpg", "jpeg", "png", "webp", "jfif"];

  for (let file of files) {
    const extension = file.name.split(".").pop().toLowerCase();

    const isValidType = validTypes.includes(file.type);
    const isValidExtension = validExtensions.includes(extension);

    if (!isValidType && !isValidExtension) {
      toast.error("Only JPG, JPEG, PNG, WEBP, JFIF allowed");
      return;
    }
  }

  // ==========================================
  // 📦 FILE SIZE VALIDATION
  // ==========================================
  for (let file of files) {
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Each image must be less than 2MB");
      return;
    }
  }

  // ==========================================
  // ✅ SAVE + PREVIEW
  // ==========================================
  setImages(files);

  const urls = files.map(file => URL.createObjectURL(file));
  setPreview(urls);
};

  const removeNewImage = (index) => {
    const newImgs = [...images];
    const newPrev = [...preview];

    URL.revokeObjectURL(newPrev[index]);// it releases the memory used by the preview URL since we are removing that image from the selection

    newImgs.splice(index, 1);
    newPrev.splice(index, 1);

    setImages(newImgs);
    setPreview(newPrev);
  };

  // it removes an old image from the oldImages state when user clicks the remove button on an existing image
  const removeOldImage = (index) => {
    const updated = [...oldImages];
    updated.splice(index, 1);
    setOldImages(updated);
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();// prevent the default form submission behavior

    // 🔥 VALIDATION
    if (!formData.name || !formData.brand || !formData.description) {
      return toast.error("Fill required fields");
    }

    if (Number(formData.offerPrice) > Number(formData.originalPrice)) {
      return toast.error("Offer price must be less than original");
    }

    if (!specs.Display || !specs.RAM) {
      return toast.error("Fill specifications");
    }

    // image validation - max 5 images allowed (including old and new)
    if (images.length + oldImages.length > 5) {
  toast.error("Max 5 images allowed");
  return;
}

    try {
      setLoading(true);

      const data = new FormData();

      // append basic info fields to form data
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      // append specifications as a JSON string to form data
      data.append("specifications", JSON.stringify(specs));

      // keep remaining old images
      data.append("oldImages", JSON.stringify(oldImages));

      // add new images
      images.forEach(img => {
        data.append("images", img);
      });

      // send the PUT request to update the product with the form data, including new images and updated specifications
      await axiosInstance.put(`/api/product/${id}`, data, {
        withCredentials: true // to include cookies for authentication
      });

      toast.success("Product updated"); // show success message after successful update 

      navigate("/admin/products"); // redirect to products list after successful update 

    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <div className="container mt-4">
      <h2>Edit Product</h2>

      <form onSubmit={handleSubmit}>

        {/* ================= BASIC INFO ================= */}

        {/* PRODUCT NAME */}
        <input
          list="productNames"
          name="name"
          value={formData.name}
          placeholder="Product Name"
          onChange={handleChange}
          className="form-control mb-2"
        />
{/* PRODUCT NAME recommendations */}
        <datalist id="productNames">
          <option value="Poco M4" />
          <option value="Poco X5 Pro" />
          <option value="iPhone 15" />
          <option value="iPhone 14 Pro Max" />
          <option value="Samsung Galaxy S23" />
          <option value="Samsung Galaxy S22 Ultra" />
          <option value="OnePlus 11" />
          <option value="OnePlus Nord CE 3" />
          <option value="Redmi Note 12" />
          <option value="Realme GT Neo 3" />
          <option value="Nothing Phone 2" />
          <option value="Google Pixel 7" />
        </datalist>

        {/* BRAND */}
        <input
          list="brandOptions"
          name="brand"
          value={formData.brand}
          placeholder="Brand"
          onChange={handleChange}
          className="form-control mb-2"
        />
{/* BRAND recommendations */}
        <datalist id="brandOptions">
          <option value="Poco" />
          <option value="Redmi" />
          <option value="Xiaomi" />
          <option value="Realme" />
          <option value="Nothing" />
          <option value="Apple" />
          <option value="Samsung" />
          <option value="OnePlus" />
        </datalist>

        {/* ORIGINAL PRICE */}
        <input
          name="originalPrice"
          value={formData.originalPrice}
          placeholder="Original Price"
          onChange={handleChange}
          className="form-control mb-2"
        />

        {/* OFFER PRICE */}
        <input
          name="offerPrice"
          value={formData.offerPrice}
          placeholder="Offer Price"
          onChange={handleChange}
          className="form-control mb-2"
        />

        {/* QUANTITY */}
        <input
          name="quantity"
          value={formData.quantity}
          placeholder="Quantity"
          onChange={handleChange}
          className="form-control mb-2"
        />

        {/* DESCRIPTION */}
        <input
          list="descOptions"
          name="description"
          value={formData.description}
          placeholder="Description"
          onChange={handleChange}
          className="form-control mb-2"
        />
        {/* DESCRIPTION recommendations */}
        <datalist id="descOptions">
          <option value="Powerful smartphone with high performance processor and long battery life." />
          <option value="Premium flagship device with advanced camera and smooth display." />
          <option value="Budget-friendly phone with solid performance and good battery backup." />
          <option value="Gaming-focused smartphone with fast refresh rate display." />
          <option value="Stylish smartphone with AMOLED display and modern design." />
          <option value="Camera-centric smartphone with AI features." />
        </datalist>

        {/* ================= SPECIFICATIONS ================= */}

        <h5 className="mt-3">Specifications</h5>

        {/* DISPLAY */}
        <input
          list="displayOptions"
          name="Display"
          value={specs.Display}
          placeholder="Display"
          onChange={handleSpecsChange}
          className="form-control mb-2"
        />
{/* DISPLAY recommendations */}
        <datalist id="displayOptions">
          <option value="6.1 inch AMOLED" />
          <option value="6.5 inch AMOLED" />
          <option value="6.7 inch AMOLED" />
          <option value="6.8 inch AMOLED" />
        </datalist>

        {/* PROCESSOR */}
        <input
          list="processorOptions"
          name="Processor"
          value={specs.Processor}
          placeholder="Processor"
          onChange={handleSpecsChange}
          className="form-control mb-2"
        />
{/* PROCESSOR recommendations */}
        <datalist id="processorOptions">
          <option value="Snapdragon 870" />
          <option value="Snapdragon 888" />
          <option value="Snapdragon 8 Gen 1" />
          <option value="Dimensity 9000" />
          <option value="A16 Bionic" />
        </datalist>

        {/* CAMERA */}
        <select
          name="Camera"
          value={specs.Camera}
          onChange={handleSpecsChange}
          className="form-control mb-2"
        >
          {/* CAMERA recommendations */}
          <option value="">Select Camera</option>
          <option value="48MP">48MP</option>
          <option value="64MP">64MP</option>
          <option value="108MP">108MP</option>
        </select>

        {/* BATTERY */}
        <select
          name="Battery"
          value={specs.Battery}
          onChange={handleSpecsChange}
          className="form-control mb-2"
        >
          {/* BATTERY recommendations */}
          <option value="">Select Battery</option>
          <option value="4000mAh">4000mAh</option>
          <option value="5000mAh">5000mAh</option>
          <option value="6000mAh">6000mAh</option>
        </select>

        {/* STORAGE */}
        <select
          name="Storage"
          value={specs.Storage}
          onChange={handleSpecsChange}
          className="form-control mb-2"
        >
          {/* STORAGE recommendations */}
          <option value="">Select Storage</option>
          <option value="64GB">64GB</option>
          <option value="128GB">128GB</option>
          <option value="256GB">256GB</option>
        </select>

        {/* RAM */}
        <select
          name="RAM"
          value={specs.RAM}
          onChange={handleSpecsChange}
          className="form-control mb-3"
        >
          {/* RAM recommendations */}
          <option value="">Select RAM</option>
          <option value="4GB">4GB</option>
          <option value="6GB">6GB</option>
          <option value="8GB">8GB</option>
          <option value="12GB">12GB</option>
        </select>

        {/* ================= OLD IMAGES ================= */}

        <h5>Old Images</h5>
        <div className="d-flex gap-2 flex-wrap mb-3">
          {oldImages.map((img, index) => (
            <div key={index} style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => removeOldImage(index)}
                style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-8px",
                  background: "red",
                  color: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  cursor: "pointer"
                }}
              >
                ×
              </button>
              <img src={img} width="80" style={{ borderRadius: "10px" }} />
            </div>
          ))}
        </div>

        {/* ================= NEW IMAGES ================= */}

<small style={{ color: "#888" }}>
  Maximum 5 images allowed
</small>
        <input
          type="file"
          multiple
          onChange={handleImageChange}
          className="form-control mb-3"
        />


        <div className="d-flex gap-2 flex-wrap mb-3">
          {preview.map((img, index) => (
            <div key={index} style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => removeNewImage(index)}
                style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-8px",
                  background: "red",
                  color: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  cursor: "pointer"
                }}
              >
                ×
              </button>
              <img src={img} width="80" style={{ borderRadius: "10px" }} />
            </div>
          ))}
        </div>

        {/* ================= BUTTON ================= */}

        <button
          className="btn btn-success w-100"
          disabled={loading}
          // disable the button and show loading state while the update request is in progress to prevent multiple submissions and indicate to the user that something is happening
          style={{
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Updating..." : "Update Product"}
        </button>

      </form>
    </div>
  );
};

export default EditProduct;