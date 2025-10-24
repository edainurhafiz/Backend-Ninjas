import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import { z } from "zod";


const orderValidator = z.object({
  userId: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
    })
  ),
  totalAmount: z.number().positive(),
  paymentMethod: z.string(),
});




export const getOrders = async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    const orders = await Order.find(filter);

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
};


export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch order", error: err.message });
  }
};


export const createOrder = async (req, res) => {
  try {
    const validated = orderValidator.parse(req.body);


    const calculatedTotal = validated.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    if (Math.abs(calculatedTotal - validated.totalAmount) > 0.01) {
      return res.status(400).json({ message: "Total amount mismatch" });
    }


    const newOrder = new Order({
      userId: validated.userId,
      items: validated.items,
      totalAmount: validated.totalAmount,
      paymentMethod: validated.paymentMethod,
      status: "Pending",
      createdAt: new Date(),
    });

    await newOrder.save();


    await Cart.findOneAndUpdate(
      { userId: validated.userId },
      { items: [], total: 0 }
    );

    res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (err) {
    res.status(400).json({ message: "Failed to create order", error: err.message });
  }
};


export const updateOrder = async (req, res) => {
  try {
    const { status, paymentMethod } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (status) order.status = status;
    if (paymentMethod) order.paymentMethod = paymentMethod;

    await order.save();

    res.status(200).json({ message: "Order updated successfully", order });
  } catch (err) {
    res.status(400).json({ message: "Failed to update order", error: err.message });
  }
};


export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete order", error: err.message });
  }
};


export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId });
    if (!orders.length)
      return res.status(404).json({ message: "No orders found for this user" });

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user orders", error: err.message });
  }
};
