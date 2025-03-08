import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        type: mongoose.ObjectId,
        ref: "Products",
        required: true, 
      },
    ],
    payment: {
      type: Object,
      required: true,
      validate: {
        validator: function (value) {
          return value.amount >= 0;
        },
        message: "Payment amount cannot be negative.",
      },
    },
    buyer: {
      type: mongoose.ObjectId,
      ref: "users",
      required: true, 

    },
    status: {
      type: String,
      default: "Not Process",
      enum: ["Not Process", "Processing", "Shipped", "Delivered", "Cancelled"],
    },
  },
  { timestamps: true }
);

orderSchema.path("products").validate(function (value) {
  return value.length > 0; 
}, "Order must have at least one product.");

export default mongoose.model("Order", orderSchema);
