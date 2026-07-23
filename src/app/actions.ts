'use server'

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function login(role: 'WAITER' | 'KITCHEN', pin: string) {
  if (role === 'WAITER' && pin === '1234') {
    (await cookies()).set('respos-role', 'WAITER')
    redirect('/')
  } else if (role === 'KITCHEN' && pin === '0000') {
    (await cookies()).set('respos-role', 'KITCHEN')
    redirect('/kitchen')
  }
  return { error: 'არასწორი PIN' }
}

export async function logout() {
  (await cookies()).delete('respos-role')
  redirect('/login')
}

// კერძების წამოღება (Dish მოდელიდან)
export async function getDishes() {
  const items = await prisma.dish.findMany({ orderBy: { id: 'desc' } })
  return items
}

// ძველი დასახელების თავსებადობა
export async function getMenuItems() {
  return await getDishes()
}

// კერძის დამატება
export async function createDish(name: string, price: number) {
  try {
    const newDish = await prisma.dish.create({
      data: { name, price: Number(price) },
    })
    revalidatePath('/menu')
    return { success: true, dish: newDish }
  } catch (error) {
    return { success: false, error: 'ვერ მოხერხდა კერძის დამატება' }
  }
}

// ახალი შეკვეთის შექმნა სქემის მიხედვით (რედირექტის გარეშე)
export async function createNewOrder(items: { dishId: number; qty: number }[]) {
  try {
    const order = await prisma.order.create({
      data: {
        status: 'PREPARING',
        items: {
          create: items.map((i) => ({
            dishId: i.dishId,
            qty: i.qty,
          })),
        },
      },
      include: {
        items: {
          include: {
            dish: true,
          },
        },
      },
    })

    revalidatePath('/')
    revalidatePath('/history')
    revalidatePath('/order-history')
    return order
  } catch (error) {
    console.error('Failed to create order:', error)
    return null
  }
}

// შეკვეთების სია
export async function getOrders() {
  return await prisma.order.findMany({
    include: {
      items: {
        include: {
          dish: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

// შეკვეთის დასრულება (id არის number)
export async function completeOrder(orderId: number) {
  try {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'DONE' },
      include: {
        items: {
          include: { dish: true },
        },
      },
    })

    revalidatePath('/')
    revalidatePath('/history')
    revalidatePath('/order-history')
    revalidatePath('/kitchen')
    return updatedOrder
  } catch (error) {
    console.error('Failed to complete order:', error)
    return null
  }
}

export async function updateOrder(orderId: number, cart: { dishId: number, qty: number }[]) {
  try {
    // ჯერ ვშლით ძველ items-ებს და ვქმნით ახლებს
    await prisma.orderItem.deleteMany({ where: { orderId } })
    
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        items: {
          create: cart.map(item => ({
            dishId: item.dishId,
            qty: item.qty
          }))
        }
      },
      include: { items: { include: { dish: true } } }
    })

    revalidatePath('/')
    revalidatePath('/history')
    revalidatePath('/order-history')
    revalidatePath('/kitchen')
    return updatedOrder
  } catch (error) {
    console.error('Failed to update order:', error)
    return null
  }
}



// კერძის რედაქტირება (სახელი და ფასი)
export async function updateDish(id: number, name: string, price: number) {
  try {
    await prisma.dish.update({
      where: { id },
      data: { name, price: Number(price) },
    })
    revalidatePath('/menu') // ვასუფთავებთ ქეშს მენიუს გვერდისთვის
    return { success: true }
  } catch (error) {
    return { success: false, error: 'ვერ მოხერხდა კერძის განახლება' }
  }
}

// კერძის წაშლა
export async function deleteDish(id: number) {
  try {
    await prisma.dish.delete({
      where: { id },
    })
    revalidatePath('/menu')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'ვერ მოხერხდა კერძის წაშლა (შესაძლოა დაკავშირებულია შეკვეთებთან)' }
  }
}