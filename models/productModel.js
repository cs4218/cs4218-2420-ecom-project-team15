import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
      validate: {
        validator: function(value) {
          //price can have no decimal places or up to 2 decimal places
          return value === Math.trunc(value) || value.toFixed(1) || value.toFixed(2) === value.toString();
        },
        message: "Price can only have up to 2 decimal places",
      }
    },
    category: {
      type: mongoose.ObjectId,
      ref: "Category",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, "Quantity must be a positive number"],
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be an integer value",
      }
    },
    photo: {
      data: {
        type: Buffer,
        required: true,
        contentType: String,
      },
    },
    shipping: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Products", productSchema);