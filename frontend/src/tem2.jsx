const handleImageChange = (e) => {

  // Convert FileList → Array
  const files = Array.from(e.target.files);

  // ==========================================
  // ❌ LIMIT TO MAX 5 IMAGES
  // ==========================================
  // Prevent selecting more than 5 images
  if (files.length > 5) {
    toast.error("Maximum 5 images allowed");
    return;
  }

  // ==========================================
  // 🖼 IMAGE TYPE VALIDATION
  // ==========================================
  // Allowed MIME types (browser-based)
  const validTypes = ["image/jpeg", "image/png", "image/webp"];

  // Allowed extensions (extra safety)
  const validExtensions = ["jpg", "jpeg", "png", "webp", "jfif"];

  for (let file of files) {

    // Get file extension
    const extension = file.name.split(".").pop().toLowerCase();

    // Check MIME type OR extension
    const isValidType = validTypes.includes(file.type);
    const isValidExtension = validExtensions.includes(extension);

    if (!isValidType && !isValidExtension) {
      toast.error("Only JPG, JPEG, PNG, WEBP, JFIF formats are allowed");
      return;
    }
  }

  // ==========================================
  // 📦 FILE SIZE VALIDATION
  // ==========================================
  // Limit each file size to 2MB
  for (let file of files) {

    // file.size is in bytes
    // 2MB = 2 * 1024 * 1024
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Each image must be less than 2MB");
      return;
    }
  }

  // ==========================================
  // ✅ SAVE IMAGES TO STATE
  // ==========================================
  setImages(files);

  // ==========================================
  // 👁 CREATE PREVIEW IMAGES
  // ==========================================
  // Generate preview URLs for UI display
  const previewUrls = files.map(file => URL.createObjectURL(file));

  setPreview(previewUrls);
};