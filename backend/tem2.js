const productSchema = new mongoose.Schema({
  name: String,
  brand: String,
  originalPrice: Number,
  offerPrice: Number,
  quantity: Number,
  availability: String,
  specifications: Object,
  description: String,
  image: String,

  // ⭐ Reviews
  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
      },
      name: String, // user name (snapshot)
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        required: true
      }
    }
  ],

  averageRating: {
    type: Number,
    default: 0
  },

  numOfReviews: {
    type: Number,
    default: 0
  }

}, { timestamps: true });
