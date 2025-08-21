import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertToPlainObject<T>(data: T): T {
  return JSON.parse(JSON.stringify(data))
}

export function formatNumberWithDecimal(num: number): string {
  const [int, decimal] = num.toString().split('.')
  return decimal ? `${int}.${decimal.padEnd(2, '0')}` : `${int}.00`
}

// Format Errors
// eslint-disable-next-line @typescript-eslint/noexplicit-any
export function formatError(error: any) {
  // Zod Error
  if (error.name === 'ZodError') {
    const fieldErrors = Object.keys(error.issues).map(
      (field) => error.issues[field].message
    )

    return fieldErrors.join('. ')
  }
  // Prisma Error
  if (
    error.name === 'PrismaClientKnownRequestError' &&
    error.code === 'P2002'
  ) {
    const field = error.meta?.target ? error.meta.target[0] : 'Field'
    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
  }

  return typeof error.message === 'string'
    ? error.message
    : JSON.stringify(error.message)
}
