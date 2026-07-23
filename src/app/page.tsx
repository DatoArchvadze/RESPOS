import WaiterHomePage from '@/app/(waiter)/page'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Page() {
  const role = (await cookies()).get('respos-role')?.value

  if (!role) {
    redirect('/login')
  }
  
  if (role === 'KITCHEN') {
    redirect('/kitchen')
  }

  return <WaiterHomePage />
}