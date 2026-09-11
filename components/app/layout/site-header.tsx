import Link from "next/link";
import Image from "next/image"
import {HugeiconsIcon} from "@hugeicons/react";
import {
    SearchIcon,
    UserIcon,
    FavouriteIcon,
    ShoppingCart01Icon
} from "@hugeicons/core-free-icons"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput

} from "@/components/ui/input-group"
import {Button} from "@/components/ui/button"




export function SiteHeader() {
    return (
        <header className="sticky top-0 z-40 bg-white">
            <div className="bg-red-600 py-2 text-center text-xs text-white">
                <span className="mr-2 rounded bg-white/20 px-2 py-0.5 font-semibold">
                    Special
                </span>
                Get 10% DISCOUNT for first order{" "}
                <Link href="/signup" className="underline">
                    Register Now
                </Link>
            </div>

            <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-4">
                <Link href="/" className="shrink-0 text-xl font-bold text-red-600">
                   <Image
                   src="./images/Logo-combo.svg"
                   alt="oyingold logo"
                   width={250}
                   height={150}
                    />
                </Link>

                <form action="/products" className="flex-1">
                    {/* <div className="flex items-center overflow-hidden rounded-md border"> */}
                    <InputGroup className="flex items-center rounded-4xl w-full">
                        <InputGroupInput
                            type="search"
                            name="q"
                            placeholder="Search anything..."
                            className="w-full py-2 text-sm"
                        />
                        <InputGroupAddon align="inline-end" className="flex items-center justify-end">
                        <Button
                            type="submit"
                            variant="outline"
                            aria-label="Search"
                            className="h-8 w-8 bg-red-600 text-white rounded-full hover:bg-red-300"
                        >
                            <HugeiconsIcon icon={SearchIcon} size={18} />
                        </Button>
                        </InputGroupAddon>
                    </InputGroup>
                    {/* </div> */}
                </form>

                <nav className="flex shrink-0 items-center gap-5 text-sm">
                    <Link href="/login" className="flex items-center gap-1.5 text-blue-950">
                        <HugeiconsIcon icon={UserIcon} size={20} className="fill-blue-600" />
                        <span className="hidden sm:inline">Login or Register</span>
                    </Link>

                    <Link href="/wishlist" className="relative text-blue-950" aria-label="Wishlist">
                        <HugeiconsIcon icon={FavouriteIcon} size={20} className="fill-blue-600"  />
                        <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">
                            0
                        </span>
                    </Link>

                    <Link href="/cart" className="relative text-blue-950" aria-label="Cart">
                        <HugeiconsIcon icon={ShoppingCart01Icon} size={20}className="fill-blue-600" />
                        <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">
                            0
                        </span>
                    </Link>
                </nav>
            </div>

            <div className="border-t border-b flex items-center justify-center">
                <div className="mx-auto flex max-w-6xl gap-6 px-4 py-2.5 text-sm font-medium">
                    <Link href="/" className="text-blue-950">Home</Link>
                    <Link href="/products" className="text-blue-950">Shop</Link>
                    <Link href="/contact" className="text-blue-950">Contact</Link>
                </div>
            </div>
        </header>
    )
}