import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: 2,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    ratings: [
      {
        type: Number,
        min: 0,
        max: 5,
      },
    ],
    imageUrl: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

productSchema.pre("save", function (next) {
  this.isAvailable = this.stock > 0;
  next();
});

export default mongoose.model("Product", productSchema);
