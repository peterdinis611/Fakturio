import { redirect } from "next/navigation";

export const metadata = { title: "Nastavenia" };

export default function SettingsIndexPage() {
  redirect("/settings/company");
}
