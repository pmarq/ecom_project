"use client";

import { Button, Input } from "@material-tailwind/react";
import Image from "next/image";
import React, {
  ChangeEventHandler,
  useEffect,
  useState,
  useTransition,
} from "react";
import * as Yup from "yup";
import { uploadImage } from "../utils/helper";
import { createFeaturedProduct, updateFeaturedProduct } from "../(admin)/products/featured/action";
import { toast } from "react-toastify";
import { FeaturedProductForUpdate } from "../types";
import { removeImageFromCloud } from "../(admin)/products/action";
import { useRouter } from "next/navigation";



export interface FeaturedProduct {
  file?: File;
  title: string;
  link: string;
  linkTitle: string;
}

interface Props {
  initialValue?: any;
}

const commonValidationFeaturedProduct = {
  title: Yup.string().required("Title is required"),
  link: Yup.string().required("Link is required"),
  linkTitle: Yup.string().required("Link title is required"),
};

const newFeaturedProductValidationSchema = Yup.object().shape({
  file: Yup.mixed<File>()
    .required("File is required")
    .test(
      "fileType",
      "Invalid file format. Only image files are allowed.",
      (value) => {
        if (value) {
          const supportedFormats = ["image/jpeg", "image/png", "image/gif"];
          return supportedFormats.includes((value as File).type);
        }
        return true;
      }
    ),
  ...commonValidationFeaturedProduct,
});

const oldFeaturedProductValidationSchema = Yup.object().shape({
  file: Yup.mixed<File>().test(
    "fileType",
    "Invalid file format. Only image files are allowed.",
    (value) => {
      if (value) {
        const supportedFormats = ["image/jpeg", "image/png", "image/gif"];
        return supportedFormats.includes((value as File).type);
      }
      return true;
    }
  ),
  ...commonValidationFeaturedProduct,
});

const defaultProduct = {
  title: "",
  link: "",
  linkTitle: "",
};

export default function FeaturedProductForm({ initialValue }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isForUpdate, setIsForUpdate] = useState(false);
  const [featuredProduct, setFeaturedProduct] =
    useState<FeaturedProduct>(defaultProduct);
    const router = useRouter()

  const handleChange: ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    const { name, value, files } = target;

    if (name === "file" && files) {
      const file = files[0];
      if (file) setFeaturedProduct({ ...featuredProduct, file });
    } else setFeaturedProduct({ ...featuredProduct, [name]: value });
  };

  const handleCreate = async () => {
    try {
       const { link, linkTitle, title, file } = 
        await newFeaturedProductValidationSchema.validate(
            {...featuredProduct}, 
            { abortEarly: false });
      if (featuredProduct.file != undefined) {
        const banner = await uploadImage(featuredProduct.file);
        console.log({ banner });
        await createFeaturedProduct({ banner, link, linkTitle, title });
        router.refresh();
        setFeaturedProduct({...defaultProduct});
        
      }
    } catch (error) {
        if(error instanceof Yup.ValidationError) {
            error.inner.map((err) => {
                toast.error(err.message)
            })
        }
    }
  };

  const handleUpdate = async () => {
    try {
        const { link, linkTitle, title, file } = 
        await oldFeaturedProductValidationSchema.validate(
            {...featuredProduct}, 
            { abortEarly: false });

      const data: FeaturedProductForUpdate = {
          link,
          linkTitle,
          title
      }  

      console.log("bannerFile====>", file)
      console.log("bannerOld", initialValue.banner)   

      const source = initialValue.banner
      const splittedData = source.split("/")
      console.log("Data BannrtOld",splittedData)
      const lastItem = splittedData[splittedData.length -1];
      const publicIdOld = lastItem.split(".")[0]; 
      await removeImageFromCloud(publicIdOld);

      if (featuredProduct.file != undefined) {

        const banner = await uploadImage(featuredProduct.file)
        data.banner = banner
    } 
    await updateFeaturedProduct(initialValue.id, data);  
    router.refresh();
    router.push('/products/featured/add');

    } catch (error) {
        if(error instanceof Yup.ValidationError) {
            error.inner.map((err) => {
                toast.error(err.message)                
            })
        }
    }
  };

  const handleSubmit = async () => {
    if (isForUpdate) await handleUpdate();
    else await handleCreate();
  };

  useEffect(() => {
    if (initialValue) {
      setFeaturedProduct({ ...initialValue });
      setIsForUpdate(true);
    }
  }, [initialValue]);

  const poster = featuredProduct.file
    ? URL.createObjectURL(featuredProduct.file)
    : initialValue?.banner || "";

  const { link, linkTitle, title } = featuredProduct;

  return (
    <form
      action={() => startTransition(async () => await handleSubmit())}
      className="py-4 space-y-4"
    >
      <label htmlFor="banner-file">
        <input
          type="file"
          accept="image/*"
          id="banner-file"
          name="file"
          onChange={handleChange}
          hidden
        />
        <div className="h-[380px] w-full flex flex-col items-center justify-center border border-dashed border-blue-gray-400 rounded cursor-pointer relative">
          {poster ? (
            <Image alt="banner" src={poster || initialValue?.banner} fill />
          ) : (
            <>
              <span>Select Banner</span>
              <span>1140 x 380</span>
            </>
          )}
        </div>
      </label>
      <Input
        label="Title"
        name="title"
        value={title}
        onChange={handleChange}
        crossOrigin={undefined}
      />
      <div className="flex space-x-4">
        <Input
          label="Link"
          name="link"
          value={link}
          onChange={handleChange}
          crossOrigin={undefined}
        />
        <Input
          label="Link Title"
          name="linkTitle"
          value={linkTitle}
          onChange={handleChange}
          crossOrigin={undefined}
        />
      </div>
      <div className="text-right">
        <Button disabled={isPending} type="submit">{isForUpdate ? "Update" : "Submit"}</Button>
      </div>
    </form>
  );
}