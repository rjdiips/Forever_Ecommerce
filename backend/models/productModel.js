import mongoose from 'mongoose';
import { CATEGORIES, PRODUCT_KIND, SUB_CATEGORIES } from '@forever/shared';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: Array, required: true },
  category: { type: String, enum: CATEGORIES, required: true },
  subCategory: { type: String, enum: SUB_CATEGORIES, required: true },
  sizes: { type: Array, required: true },
  bestseller: { type: Boolean },
  // "standard" for ordinary products; "custom-tee" marks the one base product
  // the tee generator designs onto. Products saved before this field existed
  // read back as "standard".
  kind: {
    type: String,
    enum: [PRODUCT_KIND.STANDARD, PRODUCT_KIND.CUSTOM_TEE],
    default: PRODUCT_KIND.STANDARD,
  },
  date: { type: Number, required: true },
});

const ProductModel =
  mongoose.model.product || mongoose.model('Product', productSchema);

export default ProductModel;
