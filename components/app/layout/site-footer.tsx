import Link from "next/link";


export function SiteFooter() {
    return (
        <footer className="mt-16">
            <div className="bg-red-600 px-4 py-6">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
                    <p className="text-center text-lg font-bold text-white sm:text-left">
                        SIGN UP TODAY AND GET
                        <br />
                        10% DISCOUNT OFF
                    </p>
                    <form className="flex w-full max-w-sm gap-2 sm:w-auto">
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            className="w-full rounded-md px-3 py-2 text-sm outline-none"
                        />
                        <button
                            type="submit"
                            className="shrink-0 rounded-md bg-white px-4 py-2 text-sm font-semibold text-red-600"
                        >
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>

            <div className="bg-blue-950 px-4 py-10 text-blue-100">
                <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 sm:grid-cols-4">
                    <div className="col-span-2 sm:col-span-1">
                        <p className="text-lg font-bold text-white">OYINGOLD RETAIL</p>
                        <p className="mt-2 text-sm text-blue-200">
                            We have fresh, quality ingredients and food items that delight
                            your taste buds and nourish your body.
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-semibold tracking-wide text-red-400">COMPANY</p>
                        <ul className="mt-3 space-y-2 text-sm">
                            <li><Link href="/about">About</Link></li>
                            <li><Link href="/products">Shop</Link></li>
                            <li><Link href="/contact">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <p className="text-xs font-semibold tracking-wide text-red-400">HELP</p>
                        <ul className="mt-3 space-y-2 text-sm">
                            <li><Link href="/contact">Customer Support</Link></li>
                            <li><Link href="/terms">Terms & Conditions</Link></li>
                            <li><Link href="/privacy">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    <div>
                        <p className="text-xs font-semibold tracking-wide text-red-400">FAQ</p>
                        <ul className="mt-3 space-y-2 text-sm">
                            <li><Link href="/orders">Orders</Link></li>
                            <li><Link href="/wishlist">Wishlist</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mx-auto mt-8 max-w-6xl border-t border-blue-800 pt-4 text-xs text-blue-300">
                    Oyingold Retail © {new Date().getFullYear()}, All Rights Reserved
                </div>
            </div>
        </footer>
    )
}