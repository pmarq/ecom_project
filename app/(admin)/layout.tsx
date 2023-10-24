import React, { ReactNode } from 'react'
import { getServerSession } from "next-auth"
import { authOptions } from '../api/auth/[...nextauth]/route' 
import { redirect } from 'next/navigation'
import AdminSidebar from '../components/AdminSidebar'  

interface Props {
    children: ReactNode
}

export default async function AdminLayout({children}: Props) {
    const session = await getServerSession(authOptions)
    console.log("Auth Session", session)

    const user = session?.user
    const isAdmin = user?.role === "ADMIN"

    if (!isAdmin) return redirect("/auth/signin")

    console.log(isAdmin)
    
   
  return (
    <AdminSidebar>      
    {children}
    </AdminSidebar>
  )
}