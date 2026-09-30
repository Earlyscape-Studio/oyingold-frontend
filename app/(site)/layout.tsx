import {SiteHeader} from "@/components/app/layout/site-header";
import {SiteFooter} from "@/components/app/layout/site-footer";
import {CartDrawer} from "@/components/app/CartDrawer"

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <CartDrawer />
    </>
  );
}