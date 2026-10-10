import { AccountsManager } from "@/components/accounts/AccountsManager";

export const metadata = {
  title: "Accounts & API Hub | OmniSocial Hub",
  description: "OAuth token manager, rate limit monitor, and social account health dashboard",
};

export default function AccountsPage() {
  return <AccountsManager />;
}
