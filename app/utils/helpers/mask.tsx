interface Prods {
    title: string;
    description: string;
    bulletPoints: string[];
    mrp: number;
    salePrice: number;
    category: string;
    quantity: number;
  }
  
  export const showReaisMask = (
    info: string,
    productInfo: Prods,
    setProductInfo: (i: Prods) => void,
    field: "mrp" | "salePrice"
  ) => {  
  
    const onlyNumbers: any = info.replace(/\D/g, "");
    const stringWithMask = (onlyNumbers / 100)
      .toFixed(2)
      .replace(".", ",")
      .replace(/\d(?=(\d{3})+,)/g, "$&.");
  
    const dot = stringWithMask.replace(".", "");
    const rep = dot.replace(",", ".");
    const num = Number(rep);  

  
    //------------------
    const cond = productInfo[`${field}`] !== num;
    if (cond) setProductInfo({ ...productInfo, [`${field}`]: num });
     
  
    return { mask: stringWithMask };  
   

    //------------------
  };