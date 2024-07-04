import { getCloudConfig, getCloudSigature } from "../(admin)/products/action";

export const uploadImage = async (file: File) => {
  const { timestamp, signature } = await getCloudSigature();
  const cloudConfig = await getCloudConfig();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", cloudConfig.key);
  formData.append("signature", signature);
  formData.append("timestamp", timestamp.toString());

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudConfig.name}/image/upload`;

  const res = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  return { url: data.secure_url, publicId: data.public_id };
};

export const getPublicIdImg = (url: string) => {
  const splittedData = url.split("/");
  const lastItem = splittedData[splittedData.length - 1];
  const publicId = lastItem.split(".")[0];
  return publicId;
};
