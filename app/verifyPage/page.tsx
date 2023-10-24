"use client"

import React, { useEffect } from 'react';
import { notFound, useRouter } from "next/navigation";
import { toast } from 'react-toastify';

interface Props {
    searchParams: {token: string, userId: string}
}

export default function VerifyPage(props: Props) {
    const  {token, userId} = props.searchParams
    const router = useRouter()

    // Verify the token and userId

    useEffect(() =>{
        fetch('/api/users/verify', {
            method: "POST",
            body: JSON.stringify({token, userId})
        }).then( async res =>{
            const apiRes = await res.json()

           const{ error , message } = apiRes as { message: string ; error: string }

           if(res.ok) {
           //sucess
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
