import React, { useState } from "react";
import axiosInstance from "../../axios_instance";
import { toast } from "react-toastify";

const AddProduct = () => {

  // ==========================================
  // 🧠 MAIN FORM DATA
  // ==========================================
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    originalPrice: "",
    offerPrice: "",
    quantity: "",
    description: ""
  });

  // ==========================================
  // 🧠 SPECIFICATIONS (SEPARATE STATE)
  // ==========================================
  const [specs, setSpecs] = useState({
    Display: "",
    Processor: "",
    Camera: "",
    Battery: "",
    Storage: "",
    RAM: ""
  });

  // ==========================================
  // 🖼 IMAGES
  // ==========================================
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);

  const [loading, setLoading] = useState(false);

  // ==========================================
  // INPUT CHANGE
  // ==========================================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ==========================================
  // SPEC CHANGE
  // ==========================================
  const handleSpecsChange = (e) => {
    setSpecs({
      ...specs,
      [e.target.name]: e.target.value
    });
  };

  // ==========================================
  // IMAGE SELECT
  // ==========================================
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    setImages(files);

    const previewUrls = files.map(file => URL.createObjectURL(file));
    setPreview(previewUrls);
  };

  // ==========================================
  // REMOVE IMAGE ❌
  // ==========================================
  const handleRemoveImage = (index) => {
    const newImages = [...images];
    const newPreview = [...preview];

    newImages.splice(index, 1);
    newPreview.splice(index, 1);

    setImages(newImages);
    setPreview(newPreview);
  };

  // ==========================================
  // SUBMIT
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const data = new FormData();

      // TEXT DATA
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      // SPECIFICATIONS (IMPORTANT)
      data.append("specifications", JSON.stringify(specs));

      // IMAGES
      images.forEach(img => {
        data.append("images", img);
      });

      const res = await axiosInstance.post(
        "/api/product",
        data,
        { withCredentials: true }
      );

      toast.success(res.data.message);

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">

      <h2>Add Product</h2>

      <form onSubmit={handleSubmit}>

        {/* BASIC INFO */}
        <input name="name" placeholder="Name" onChange={handleChange} className="form-control mb-2" />
        <input name="brand" placeholder="Brand" onChange={handleChange} className="form-control mb-2" />
        <input name="originalPrice" placeholder="Original Price" onChange={handleChange} className="form-control mb-2" />
        <input name="offerPrice" placeholder="Offer Price" onChange={handleChange} className="form-control mb-2" />
        <input name="quantity" placeholder="Quantity" onChange={handleChange} className="form-control mb-2" />
        <textarea name="description" placeholder="Description" onChange={handleChange} className="form-control mb-2" />

        {/* ================= SPECIFICATIONS ================= */}

        <h5 className="mt-3">Specifications</h5>
        {/* DISPLAY (suggestion) */}
        <input
          list="displayOptions"
          name="Display"
          placeholder="Display"
          onChange={handleSpecsChange}
          className="form-control mb-2"
        />
        <datalist id="displayOptions">
          <option value="6.1 inch AMOLED" />
          <option value="6.5 inch AMOLED" />
          <option value="6.7 inch AMOLED" />
          <option value="6.8 inch AMOLED" />
        </datalist>

        {/* PROCESSOR (suggestion) */}
        <input
          list="processorOptions"
          name="Processor"
          placeholder="Processor"
          onChange={handleSpecsChange}
          className="form-control mb-2"
        />
        <datalist id="processorOptions">
          <option value="Snapdragon 870" />
          <option value="Snapdragon 888" />
          <option value="Snapdragon 8 Gen 1" />
          <option value="Dimensity 9000" />
          <option value="A16 Bionic" />
        </datalist>

        {/* CAMERA */}
        <select name="Camera" onChange={handleSpecsChange} className="form-control mb-2">
          <option value="">Select Camera</option>
          <option value="48MP">48MP</option>
          <option value="64MP">64MP</option>
          <option value="108MP">108MP</option>
        </select>

        {/* BATTERY */}
        <select name="Battery" onChange={handleSpecsChange} className="form-control mb-2">
          <option value="">Select Battery</option>
          <option value="4000mAh">4000mAh</option>
          <option value="5000mAh">5000mAh</option>
        </select>

        {/* STORAGE */}
        <select name="Storage" onChange={handleSpecsChange} className="form-control mb-2">
          <option value="">Select Storage</option>
          <option value="64GB">64GB</option>
          <option value="128GB">128GB</option>
          <option value="256GB">256GB</option>
        </select>

        {/* RAM */}
        <select name="RAM" onChange={handleSpecsChange} className="form-control mb-3">
          <option value="">Select RAM</option>
          <option value="4GB">4GB</option>
          <option value="6GB">6GB</option>
          <option value="8GB">8GB</option>
          <option value="12GB">12GB</option>
        </select>

        {/* ================= IMAGE ================= */}

        <input type="file" multiple onChange={handleImageChange} className="form-control mb-3" />

        {/* PREVIEW WITH REMOVE */}
        <div className="d-flex gap-2 flex-wrap mb-3">
          {preview.map((img, index) => (
            <div key={index} style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
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

        <button className="btn btn-primary w-100">
          {loading ? "Uploading..." : "Add Product"}
        </button>

      </form>
    </div>
  );
};

export default AddProduct;