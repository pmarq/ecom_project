import React, { ReactNode } from 'react'
import { getServerSession } from "next-auth"
import { authOptions } from '../api/auth/[...nextauth]/route' 
import { redirect } from 'next/navigation'
import Navbar from '../components/navbar'

interface Props {
    children: ReactNode
}

export default async function PrivateLayout({children}: Props) {   
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/auth/signin")
  
   
  return (
    <div className='max-w-screen-xl mx-auto p-4 xl:p-0'>
      <Navbar/>    
      {children}
      </div>
  )
}
