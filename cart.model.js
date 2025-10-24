import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
      },
    ],
    total: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "ordered", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true }
);

cartSchema.pre("save", async function (next) {
  try {
    const Product = mongoose.model("Product");
    let total = 0;

    for (const item of this.items) {
      const product = await Product.findById(item.productId);
      if (product) total += product.price * item.quantity;
    }

    this.total = total;
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model("Cart", cartSchema);
