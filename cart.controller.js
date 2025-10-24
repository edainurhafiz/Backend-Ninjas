import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import { z } from "zod";

const cartValidator = z.object({
  userId: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ),
});

const calculateTotal = async (items) => {
  let total = 0;
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) throw new Error(`Product not found: ${item.productId}`);
    total += product.price * item.quantity;
  }
  return total;
};


export const getCarts = async (req, res) => {
  try {
    const carts = await Cart.find();
    res.status(200).json(carts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch carts", error: err.message });
  }
};

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id);
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch cart", error: err.message });
  }
};

export const createCart = async (req, res) => {
  try {
    const validated = cartValidator.parse(req.body);

    const totalPrice = await calculateTotal(validated.items);

    const newCart = new Cart({
      userId: validated.userId,
      items: validated.items,
      total: totalPrice,
    });

    await newCart.save();
    res.status(201).json({ message: "Cart created successfully", cart: newCart });
  } catch (err) {
    res.status(400).json({ message: "Cart creation failed", error: err.message });
  }
};

export const updateCart = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id);
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const validated = cartValidator.partial().parse(req.body);

    if (validated.items) {
      cart.items = validated.items;
      cart.total = await calculateTotal(validated.items);
    }

    if (validated.userId) cart.userId = validated.userId;

    await cart.save();
    res.status(200).json({ message: "Cart updated successfully", cart });
  } catch (err) {
    res.status(400).json({ message: "Failed to update cart", error: err.message });
  }
};

export const deleteCart = async (req, res) => {
  try {
    const cart = await Cart.findByIdAndDelete(req.params.id);
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    res.status(200).json({ message: "Cart deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete cart", error: err.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];
    cart.total = 0;
    await cart.save();

    res.status(200).json({ message: "Cart cleared successfully", cart });
  } catch (err) {
    res.status(500).json({ message: "Failed to clear cart", error: err.message });
  }
};
