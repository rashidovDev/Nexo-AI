"use strict";
// import { ExtendedRequest } from "../libs/types/member";
// import {common} from "../libs/types/common";
// import { Response } from "express";
// import OrderService from '../models/Order.service';
// import Errors, { HttpCode } from "../libs/utils/Error";
// import { OrderStatus } from '../libs/enums/order.enum';
// import { OrderInquiry, OrderUpdateInput } from "../libs/types/order";
// const orderService =new OrderService();
// const orderController: common={};
// orderController.createOrder = async (req:ExtendedRequest, res: Response) => {
//   try{
//     console.log("createOrder");
//     const result =  await  orderService.createOrder(req.member,req.body);
//     res.status(HttpCode.CREATED).json(result);
//  }   catch (err) {
//     console.log("Error, createOrder:", err);
//     if(err instanceof Errors) res.status(err.code).json(err);
//     else res.status(Errors.standard.code).json(Errors.standard);
//   }
// };
// orderController.getMyOrders = async (req: ExtendedRequest, res: Response) => {
//     try {
//       console.log("getMyOrders");
//       const page = Number(req.query.page) || 1;
//       const limit = Math.max(Number(req.query.limit) || 5, 1); // Enforce minimum of 1
//       const orderStatus = (req.query.orderStatus as OrderStatus | undefined) || OrderStatus.PAUSE;
//       const inquiry: OrderInquiry = {
//         page,
//         limit,
//         orderStatus,
//       };
//       console.log("inquiry:", inquiry);
//       const result = await orderService.getMyOrders(req.member, inquiry);
//       res.status(HttpCode.OK).json(result);
//     } catch (err) {
//       console.log("Error, getMyOrders:", err);
//       if (err instanceof Errors) res.status(err.code).json(err);
//       else res.status(Errors.standard.code).json(Errors.standard);
//     }
//   };
//   orderController.updateOrder = async (req: ExtendedRequest, res: Response) => {
//     try {
//       console.log("updateOrder");
//       const input: OrderUpdateInput =req.body;
//       const result = await orderService.updateOrder(req.member, input);
//      console.log("input:", input)
//       res.status(HttpCode.CREATED).json(result);
//     } catch (err) {
//       console.log("Error, updateOrder:", err);
//       if (err instanceof Errors) res.status(err.code).json(err);
//       else res.status(Errors.standard.code).json(Errors.standard);
//     }
//   };
// export default orderController;
