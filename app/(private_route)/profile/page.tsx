import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import EmailVerificationBanner from '@/app/components/EmailVerificationBanner';
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
  if(!user) return redirect('/auth/signin');
  return {
    id: user.id.toString(),
    name: user.name,
    email: user.email,
    image: user.image,
    emailVerified: user.emailVerified
  }  
}

export default async function Profile() {
  const profile = await fetchUserProfile()
  return (
    <div>
        <EmailVerificationBanner id={profile.id} emailVerified={profile.emailVerified}/>
      <div>
        <ProfileForm avatar= {profile.image} name={profile.name} email={profile.email} id={profile.id}/>
      </div>
    </div>
  )
}
