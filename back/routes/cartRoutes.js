import express from "express"
import {addToCart, removeFromCart, getCart, clearCart} from "../controllers/cartController.js"

const cartRouter = express.Router()

cartRouter.post("/add", addToCart)
cartRouter.post("/remove", removeFromCart)
cartRouter.post("/get", getCart)
cartRouter.post("/clear", clearCart)

export default cartRouter