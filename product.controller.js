import Product from "../models/product.model.js";
import { z } from "zod";

const productValidator = z.object({
  name: z.string().min(2, "Product name too short"),
  price: z.number().positive("Price must be positive"),
  stock: z.number().int().nonnegative(),
  category: z.string().optional(),
});


export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: err.message,
    });
  }
};

export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch product",
      error: err.message,
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    const validated = productValidator.parse(req.body);

    const newProduct = new Product(validated);
    await newProduct.save();

    res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (err) {
    res.status(400).json({
      message: "Product creation failed",
      error: err.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const validated = productValidator.partial().parse(req.body);

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      validated,
      { new: true }
    );

    if (!updatedProduct)
      return res.status(404).json({ message: "Product not found" });

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (err) {
    res.status(400).json({
      message: "Product update failed",
      error: err.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct)
      return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete product",
      error: err.message,
    });
  }
};
