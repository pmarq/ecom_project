import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import EmailVerificationBanner from '@/app/components/EmailVerificationBanner';
import ProfileForm from '@/app/components/ProfileForm'
import { startDb } from '@/app/lib/db';
import prisma from '@/prisma';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react'

const fetchUserProfile = async () => {
  const session = await getServerSession(authOptions) 
  if(!session?.user) return redirect('/auth/signin');
  
  await startDb(); 

  const user = await prisma.user.findUnique({    
    where: {
      id: session.user.id      
    }
  })
  if(!user) return redirect('/auth/signin');
  return {
    id: user.id.toString(),
    name: user.name ?? "",
    email: user.email ?? "",
    image: user.image ?? "",
    emailVerified: user.emailVerified
  }  
}

export default async function Profile() {
  const profile = await fetchUserProfile()
  return (
    <div>
        <EmailVerificationBanner id={profile.id} emailVerified={profile.emailVerified}/>
        <div className="flex py-4 space-y-4">
        <div className="border-r border-gray-700 p-4 space-y-4">
        <ProfileForm 
        avatar={profile.image} 
        name={profile.name} 
        email={profile.email} 
        id={profile.id}
        />
      </div>
      <div className="p-4 flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold uppercase opacity-70 mb-4">
              Your recent orders
            </h1>
            <Link href="/profile/orders" className="uppercase hover:underline">
              See all orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
