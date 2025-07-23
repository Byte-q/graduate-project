import React from 'react'
import ProfileLayout from '@/components/layouts/ProfileLayout';

export default function Profile(){
  return (
    <ProfileLayout title="لوحة التحكم" description="إدارة حسابك وإعداداتك">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">مرحبًا بك في لوحة التحكم</h1>
        <p>هنا يمكنك إدارة حسابك وإعداداتك.</p>
      </div>
    <div>index</div>
    </ProfileLayout>
  )
}
