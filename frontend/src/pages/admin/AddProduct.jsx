import React, { useState } from "react";
import axiosInstance from "../../axios_instance";
import { toast } from "react-toastify";
import { useEffect } from "react";
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

    useEffect(() => {
        // When preview changes or component unmounts: → old image URLs are removed from memory (to avoid memory leaks or app slowness)
        return () => {
            preview.forEach(url => URL.revokeObjectURL(url));
        };
    }, [preview]);

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
    // old code without commands
    // const handleImageChange = (e) => {
    //     // Convert FileList to Array 
    //     const files = Array.from(e.target.files);

    //     setImages(files);

    //     // Generate preview URLs
    //     const previewUrls = files.map(file => URL.createObjectURL(file));
    //     setPreview(previewUrls);
    // };
    const handleImageChange = (e) => {

        // ==========================================
        // 📌 STEP 1: Get files from input
        // ==========================================
        // e = event object triggered when user selects files
        // e.target = the input element
        // e.target.files = FileList (NOT a normal array)
        // Example:
        // FileList(2) [
        //   File { name: "img1.jpg", size: 12345, type: "image/jpeg" },
        //   File { name: "img2.png", size: 54321, type: "image/png" }
        // ]


        // ==========================================
        // 📌 STEP 2: Convert FileList → Array
        // ==========================================
        // FileList does not support full array methods like .map()
        // So we convert it into a real array
        const files = Array.from(e.target.files);

        // Now "files" looks like:
        // [
        //   File { name: "img1.jpg", ... },
        //   File { name: "img2.png", ... }
        // ]


        // ==========================================
        // 📌 STEP 3: Store actual files in state
        // ==========================================
        // These are the REAL files that will be sent to backend
        // (Multer / Cloudinary will use these)
        setImages(files);


        // ==========================================
        // 📌 STEP 4: Create preview URLs
        // ==========================================
        // We cannot directly display File object in <img>
        // So we create temporary URLs using browser API
        // URL.createObjectURL(file) → returns "blob:" URL
        // Example:
        // "blob:http://localhost:3000/abc123"
        const previewUrls = files.map(file =>
            URL.createObjectURL(file)
        );


        // ==========================================
        // 📌 STEP 5: Store preview URLs in state
        // ==========================================
        // These URLs are used to show image preview in UI
        // Example usage:
        // <img src={previewUrl} />
        setPreview(previewUrls);

        //{
        // Full Flow (IMPORTANT)
        // 🧑‍💻 Frontend:
        // User selects file
        // e.target.files → FileList
        // Convert to array
        // Store in state
        // Create preview URL
        // Send via FormData

        // 🖥️ Backend:
        // Multer receives files
        // Stores locally OR sends to cloud
        // Returns image URLs
        // Save URLs in DB
        //}




    };


    // ==========================================
    // REMOVE IMAGE ❌
    // ==========================================
    // old code without commands
    // const handleRemoveImage = (index) => {
    //     const newImages = [...images];//create copy of images array
    //     const newPreview = [...preview];// create copy of preview array

    //     newImages.splice(index, 1);//remove 1 item at index
    //     newPreview.splice(index, 1);//remove 1 item at index

    //     setImages(newImages);
    //     setPreview(newPreview);
    // };
    const handleRemoveImage = (index) => {

        // create copy of images array
        const newImages = [...images];

        // create copy of preview array
        const newPreview = [...preview];

        // free memory for removed preview image
        URL.revokeObjectURL(newPreview[index]);

        // remove image from images array
        newImages.splice(index, 1);

        // remove preview from preview array
        newPreview.splice(index, 1);

        // update state (UI will update automatically)
        setImages(newImages);
        setPreview(newPreview);
    };

    // ==========================================
    // SUBMIT
    // ==========================================
    const handleSubmit = async (e) => {
        e.preventDefault();

        // ==========================================
        // 🚨 FRONTEND VALIDATION
        // ==========================================

        // Empty input check
        if (
            !formData.name ||
            !formData.brand ||
            !formData.originalPrice ||
            !formData.offerPrice ||
            !formData.quantity ||
            !formData.description
        ) {
            toast.error("Please fill all required fields");
            return;
        }

        // Price validation
        if (Number(formData.offerPrice) > Number(formData.originalPrice)) {
            toast.error("Offer price should be less than original price");
            return;
        }

        // Quantity validation
        if (formData.quantity <= 0) {
            toast.error("Quantity must be greater than 0");
            return;
        }

        // ==========================================
        // 📱 STRICT SPECIFICATIONS VALIDATION
        // ==========================================
        // Check ALL fields are filled
        if (
            !specs.Display || !specs.Processor ||
            !specs.Camera || !specs.Battery ||
            !specs.Storage || !specs.RAM
        ) {
            toast.error("Please fill all specifications");
            return;
        }

        // Image validation
        if (images.length === 0) {
            toast.error("Please upload at least one image");
            return;
        }


        try {
            setLoading(true);
            // FormData is a special type of object used to send files and data together in HTTP requests (especially for multipart/form-data)
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
            console.log([...data]); // For debugging: shows all key-value pairs in FormData
            const res = await axiosInstance.post(
                "/api/product",
                data,
                { withCredentials: true }
            );

            toast.success(res.data.message);
            // Reset main form
            setFormData({
                name: "",
                brand: "",
                originalPrice: "",
                offerPrice: "",
                quantity: "",
                description: ""
            });

            // Reset specifications
            setSpecs({
                Display: "",
                Processor: "",
                Camera: "",
                Battery: "",
                Storage: "",
                RAM: ""
            });

            // Reset images
            setImages([]);
            setPreview([]);
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

                {/* Product Name */}
                <input
                    list="productNames"
                    name="name"
                    value={formData.name}
                    placeholder="Product Name"
                    onChange={handleChange}
                    className="form-control mb-2"
                />
                {/* Product Names suggestions */}
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
                    <option value="Redmi K50i" />
                    <option value="Realme Narzo 60" />
                    <option value="Realme GT Neo 3" />
                    <option value="Vivo V27" />
                    <option value="Vivo X90" />
                    <option value="Oppo Reno 10 Pro" />
                    <option value="Motorola Edge 40" />
                    <option value="Nothing Phone 2" />
                    <option value="Google Pixel 7" />
                </datalist>
                <input
                    list="brandOptions"
                    name="brand"
                    value={formData.brand}
                    placeholder="Brand"
                    onChange={handleChange}
                    className="form-control mb-2"
                />

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

                <input name="originalPrice" value={formData.originalPrice} placeholder="Original Price" onChange={handleChange} className="form-control mb-2" />
                <input name="offerPrice" value={formData.offerPrice} placeholder="Offer Price" onChange={handleChange} className="form-control mb-2" />
                <input name="quantity" value={formData.quantity} placeholder="Quantity" onChange={handleChange} className="form-control mb-2" />

                <input
                    list="descOptions"
                    name="description"
                    value={formData.description}
                    placeholder="Description"
                    onChange={handleChange}
                    className="form-control mb-2"
                />

                {/* description suggestions */}
                <datalist id="descOptions">
                    <option value="Powerful smartphone with high performance processor, smooth display, and long-lasting battery life for everyday usage." />

                    <option value="Premium flagship device featuring advanced camera system, sleek design, and top-tier performance for professionals." />

                    <option value="Budget-friendly smartphone offering great value with solid performance, decent camera, and good battery backup." />

                    <option value="High-performance mobile with gaming-focused processor, fast refresh rate display, and efficient cooling system." />

                    <option value="Stylish smartphone with modern design, vibrant AMOLED display, and optimized software experience." />

                    <option value="Camera-centric smartphone designed for photography lovers with high-resolution sensors and AI features." />

                    <option value="All-rounder smartphone with balanced performance, good battery life, and reliable day-to-day usability." />

                    <option value="Feature-rich smartphone with fast charging support, powerful chipset, and immersive display experience." />

                    <option value="Compact and lightweight smartphone with smooth performance and clean user interface for easy handling." />

                    <option value="Next-generation smartphone with flagship processor, premium build quality, and cutting-edge features." />
                </datalist>

                {/* ================= SPECIFICATIONS ================= */}

                <h5 className="mt-3">Specifications</h5>
                {/* DISPLAY (suggestion) */}
                <input
                    list="displayOptions"
                    name="Display"
                    value={specs.Display}
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
                    value={specs.Processor}
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
                <select name="Camera" value={specs.Camera} onChange={handleSpecsChange} className="form-control mb-2">
                    <option value="">Select Camera</option>
                    <option value="48MP">48MP</option>
                    <option value="64MP">64MP</option>
                    <option value="108MP">108MP</option>
                </select>

                {/* BATTERY */}
                <select name="Battery" value={specs.Battery} onChange={handleSpecsChange} className="form-control mb-2">
                    <option value="">Select Battery</option>
                    <option value="4000mAh">4000mAh</option>
                    <option value="5000mAh">5000mAh</option>
                    <option value="6000mAh">6000mAh</option>
                </select>

                {/* STORAGE */}
                <select name="Storage" value={specs.Storage} onChange={handleSpecsChange} className="form-control mb-2">
                    <option value="">Select Storage</option>
                    <option value="64GB">64GB</option>
                    <option value="128GB">128GB</option>
                    <option value="256GB">256GB</option>
                </select>

                {/* RAM */}
                <select name="RAM" value={specs.RAM} onChange={handleSpecsChange} className="form-control mb-3">
                    <option value="">Select RAM</option>
                    <option value="4GB">4GB</option>
                    <option value="6GB">6GB</option>
                    <option value="8GB">8GB</option>
                    <option value="12GB">12GB</option>
                </select>

                {/* ================= IMAGE ================= */}

                <input type="file" multiple onChange={handleImageChange} className="form-control mb-3" />

                {/* PREVIEW IMAGES WITH REMOVE */}
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

                <button
                    className="btn btn-primary w-100"
                    disabled={loading}
                    style={{
                        opacity: loading ? 0.6 : 1,
                        cursor: loading ? "not-allowed" : "pointer"
                    }}
                >
                    {loading ? "Uploading..." : "Add Product"}
                </button>

            </form>
        </div>
    );
};

export default AddProduct;