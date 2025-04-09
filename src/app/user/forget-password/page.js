import React from 'react'
import ForgetPasswordForm from '@/components/forget-password-form'
const page = () => {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ForgetPasswordForm />
      </div>
    </div>
  )
}

export default page