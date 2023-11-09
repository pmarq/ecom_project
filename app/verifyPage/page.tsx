"use client"

import React, { useEffect } from 'react';
import { notFound, useRouter } from "next/navigation";
import { toast } from 'react-toastify';
import { getSession } from 'next-auth/react';

interface Props {
    searchParams: {token: string, userId: string}
}

export default function VerifyPage(props: Props) {
    console.log("props verifypage ====>>>",props)
    const  {token, userId} = props.searchParams
    const router = useRouter()

    // Verify the token and userId

    useEffect(() =>{
        fetch('/api/users/verify', {
            method: "POST",
            body: JSON.stringify({token, userId})
        }).then( async res =>{
            const apiRes = await res.json()

           const{ error , message, emailVerified } = apiRes as { message: string ; error: string ; emailVerified: boolean }

           if(res.ok) {   
             //sucess
             if (!emailVerified) {
                const session = await getSession();
                if (session) {
                    session.user = {
                        ...session.user,
                        emailVerified: true,
                    };
                }
            }
            toast.success(message);
         }
          if(!res.ok && error) {
            toast.error(error);
           }
           router.replace('/')
        })
    }, [])

    if(!token || !userId) return notFound()

  return (
    <div className='text-3xl opacity-70 text-center p-5 animate-pulse '>
        Please wait...
       <p>We are verifying your email!</p>
    </div>
  )
}
