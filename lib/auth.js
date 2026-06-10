import { getServerSession } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

export const authOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID,
    }),
  ],

  pages: {
    signIn: "/authentication/sign-in",
  },

  callbacks: {
    async jwt({ token, account }) {

      if (account?.id_token) {
        const payload = JSON.parse(
          Buffer.from(
            account.id_token.split(".")[1],
            "base64"
          ).toString()
        );

        token.role = payload.roles?.[0];
      }

      return token;
    },

    async session({ session, token }) {
      session.user.role = token.role;
      return session;
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}