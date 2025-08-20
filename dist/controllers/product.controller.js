"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Error_1 = __importStar(require("../libs/utils/Error"));
const Product_service_1 = __importDefault(require("../services/Product.service"));
const product_enum_1 = require("../libs/enums/product.enum");
const productService = new Product_service_1.default;
const productController = {};
/** SPA **/
productController.getProducts = async (req, res) => {
    try {
        console.log("getProducts");
        const { page, limit, order, productCollection, search } = req.query;
        const inquiry = {
            order: String(order),
            page: Number(page),
            limit: Number(limit),
            productCollection: product_enum_1.ProductCollection.DISH,
            search: ""
        };
        if (productCollection)
            inquiry.productCollection = productCollection;
        if (search)
            inquiry.search = String(search);
        const result = await productService.getProducts(inquiry);
        res.status(Error_1.HttpCode.OK).json(result);
    }
    catch (err) {
        console.log("ERROR, getProducts", err);
        if (err instanceof Error_1.default)
            res.status(err.code).json(err);
        else
            res.status(Error_1.default.standard.code).json(Error_1.default.standard);
        // res.json({})
    }
};
productController.getProduct = async (req, res) => {
    try {
        console.log("getProduct");
        const { id } = req.params;
        console.log(req.member);
        const memberId = req.member?._id ?? null;
        const result = await productService.getProduct(memberId, id);
        res.status(Error_1.HttpCode.OK).json(result);
    }
    catch (err) {
        console.log("ERROR, getProduct", err);
        if (err instanceof Error_1.default)
            res.status(err.code).json(err);
        else
            res.status(Error_1.default.standard.code).json(Error_1.default.standard);
    }
};
/** SSR**/
productController.getAllProducts = async (req, res) => {
    try {
        console.log("getAllProducts");
        const data = await productService.getAllProducts();
        res.render("products", { products: data });
    }
    catch (err) {
        console.log("ERROR, getAllProducts", err);
        if (err instanceof Error_1.default)
            res.status(err.code).json(err);
        else
            res.status(Error_1.default.standard.code).json(Error_1.default.standard);
        // res.json({})
    }
};
productController.createNewProduct = async (req, res) => {
    try {
        console.log("createNewProduct");
        if (!req.files?.length)
            throw new Error_1.default(Error_1.HttpCode.INTERNAL_SERVER_ERROR, Error_1.Message.CREATION_FAILED);
        const data = req.body;
        data.productImages = req.files?.map(ele => {
            return ele.path.replace(/\\/g, "/");
        });
        await productService.createNewProduct(data);
        res.send(`<script> alert("Successfully creation"); window.location.replace('/admin/product/all') </script>`);
    }
    catch (err) {
        console.log("ERROR, createNewProduct", err);
        const message = err instanceof Error_1.default ? err.message : Error_1.Message.SOMETHING_WENT_WRONG;
        res.send(`<script> alert("${message}"); window.location.replace('/admin/signup') </script>`);
    }
};
productController.updateChosenProduct = async (req, res) => {
    try {
        console.log("updateChosenProduct");
        const id = req.params.id;
        const result = await productService.updateChosenProduct(id, req.body);
        res.status(Error_1.HttpCode.OK).json({ data: result });
    }
    catch (err) {
        console.log("ERROR, updateChosenProduct", err);
        if (err instanceof Error_1.default)
            res.status(err.code).json(err);
        else
            res.status(Error_1.default.standard.code).json(Error_1.default.standard);
        // res.json({}) 
    }
};
exports.default = productController;
