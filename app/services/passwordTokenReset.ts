export const createActivateResetToken = () => {
    const min = 100000;
    const max = 999999;
  
    // Generate a random number and convert it to a string
    const token = Math.floor(Math.random() * (max - min) + min).toString();
  
    return token;
  };