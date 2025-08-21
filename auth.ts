import NextAuth, { NextAuthConfig } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/db/prisma'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compareSync } from 'bcrypt-ts-edge'

export const config = {
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },

      async authorize(credentials) {
        if (credentials == null) return null

        // Find user in database
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        })

        // Check if user exists and if the password matches
        if (user && user.password) {
          const isMatch = compareSync(
            credentials.password as string,
            user.password
          )

          // If password matches, return user object
          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
              role: user.role,
            }
          }
        }

        // If no user found or password doesn't match, return null
        return null
      },
    }),
  ],

  callbacks: {
    async session({ session, user, trigger, token }: any) {
      // Set the user ID from the token
      session.user.id = token.sub
      session.user.role = token.role
      session.user.name = token.name

      // If there is an update, set the user name
      if (trigger === 'update') {
        session.user.name = user.name
      }
      return session
    },

    async jwt({ token, user, trigger, session }: any) {
      // Assign user fields to token
      if (user) {
        token.role = user.role

        // If user does not have name, use the email as name
        if (user.name === 'NO_NAME') {
          token.name = user.email.split('@')[0]

          await prisma.user.update({
            where: { id: user.id },
            data: { name: token.name },
          })
        }
      }

      return token
    },
  },
} satisfies NextAuthConfig

export const { auth, handlers, signIn, signOut } = NextAuth(config)
