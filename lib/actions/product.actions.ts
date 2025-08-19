'use server'
import { LATEST_PRODUCTS_LIMIT } from '../constants'
import { prisma } from '@/db/prisma'
import { convertToPlainObject } from '../utils'

export async function getLatestProducts() {
  const products = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: {
      createdAt: 'desc',
    },
  })

  return convertToPlainObject(products)
}

// Get single product by slug

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: {
      slug,
    },
  })

  return convertToPlainObject(product)
}
