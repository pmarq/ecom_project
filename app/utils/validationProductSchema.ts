import * as yup from 'yup';
import categories from './categories';

// Custom validation function for file size (1MB)
const validateFileSize = (file: File) => {
    if(!file) return true; // 
  // Check if file size is less than or equal to 1MB (1048576 bytes)
  return file.size <= 5048576;
};

// Schema for validating new product information using yup
export const newProductInfoSchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
  bulletPoints: yup.array().of(yup.string()), // Optional array of strings
  mrp: yup.number().required("Mrp is required"),
  salePrice: yup.number().
  required("Sale price is required").
  lessThan(yup.ref('mrp'), "Sale price must be less than MRP"), // Sale price must be less than MRP
  category: yup.string()
  .oneOf(categories, "Invalid category").
  required("Category is required"), // Validate against existing categories
  quantity: yup.number().required("Quantity is required").integer(),
  
  thumbnail: yup.mixed()
  .required("Thumbnail is required")
  .test("fileSize", "Thumbnail should be less than 1MB", (file) => 
  validateFileSize(file as File)), // Assuming you're using a file uploader
  
  images: yup.array().of(
    yup.mixed().test("file-size", "File size exceeds 1MB", (file) =>   
       validateFileSize(file as File)    
    )
  ), // Optional array of image files
});


