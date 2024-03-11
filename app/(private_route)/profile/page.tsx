import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ProfileForm from '@/app/components/ProfileForm'
import { startDb } from '@/app/lib/db';
import prisma from '@/prisma';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import React from 'react'

const fetchUserProfile = async () => {
  const session = await getServerSession(authOptions) 
  if(!session?.user) return redirect('/auth/signin');

  console.log("SESSION===>>>",getServerSession)
  
  await startDb();

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id      
    }
  })
  return {
    id: user?.id.toString(),
    name: user?.name,
    email: user?.email,
    avatar: user?.image?.url
  }  
}

export default async function Profile() {
  const profile = fetchUserProfile()
  return (
    <div>
      <div>
        <ProfileForm avatar= "" name='' email='' id=''/>
      </div>
    </div>
  )
}
