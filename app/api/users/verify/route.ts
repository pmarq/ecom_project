import prisma from "@/prisma";
import { NextResponse } from "next/server";



export const  POST = async (req: Request) => {
    try{ 
        
    const { token, userId } = await req.json()     

    const user = await prisma.user.findFirst({
      where: {id: userId}
    });

    if (!user) {
      return NextResponse.json ({message: "User not found!"},{status: 400});
    } ; 
    
    const activeToken = await prisma.activateToken.findFirst({
        where: {userId : user.id}
     });   

     if (!activeToken) {
      return NextResponse.json ({message: "User alredy verified"},{status: 400});
    } 

    if (token !== activeToken.token) {
      return NextResponse.json ({message: "Token incorrect"},{status: 400});
    }

    await prisma.user.update({
      where: {id: user.id},
      data: {emailVerified: true}
    })

    await prisma.activateToken.delete({
      where: {id: activeToken.id}
    })

    return NextResponse.json ({message: "User verified"},{status: 200});
  
  } catch (error) {

        return NextResponse.json(
            {
            error: "Could not verify email, Something went wrong!",
             }, 
        { status: 500 })
     }  

    };