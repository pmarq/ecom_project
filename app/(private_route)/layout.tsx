import React, { ReactNode } from 'react'
import { getServerSession } from "next-auth"
import { authOptions } from '../api/auth/[...nextauth]/route' 
import { redirect } from 'next/navigation'
import EmailVerificationBanner from '../components/EmailVerificationBanner'
import Navbar from '../components/navbar'

interface Props {
    children: ReactNode
}

export default async function PrivateLayout({children}: Props) {
    const session = await getServerSession(authOptions)
    console.log("Auth Session", session)
    if (!session) return redirect("/auth/signin")
    session.user
   
  return (
    <div className='max-w-screen-xl mx-auto p-4 xl:p-0'>
      <Navbar/>
      <EmailVerificationBanner />
      {children}
      </div>
  )
}
