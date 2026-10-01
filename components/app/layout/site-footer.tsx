import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    YoutubeIcon,
    Facebook01Icon,
    InstagramIcon,
} from "@hugeicons/core-free-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCcVisa, faCcMastercard } from "@fortawesome/free-brands-svg-icons";
import { NewsletterForm } from "./newsletter-form";


// NOTE: only /products exists right now. The rest are planned routes.
const LINK_COLUMNS = [
    {
        heading: "Company",
        links: [
            { label: "About", href: "/about" },
            { label: "Shop", href: "/products" },
            { label: "Contact", href: "/contact" },
            { label: "Career", href: "/careers" },
        ],
    },
    {
        heading: "Help",
        links: [
            { label: "Customer Support", href: "/contact" },
            { label: "Delivery Details", href: "/delivery" },
            { label: "Terms & Conditions", href: "/terms" },
            { label: "Privacy Policy", href: "/privacy" },
        ],
    },
    {
        heading: "FAQ",
        links: [
            { label: "Account", href: "/account" },
            { label: "Manage Deliveries", href: "/account/deliveries" },
            { label: "Orders", href: "/orders" },
            { label: "Payments", href: "/payments" },
        ],
    },
];

const SOCIALS = [
    { label: "YouTube", href: "#", icon: YoutubeIcon },
    { label: "Facebook", href: "#", icon: Facebook01Icon },
    { label: "Instagram", href: "#", icon: InstagramIcon },
];

// Placeholder badges. Swap for the official SVGs when you have them.
const PAYMENT_BADGES = [
    { label: "Visa", icon: faCcVisa },
    { label: "Mastercard", icon: faCcMastercard },
];


export function SiteFooter() {
    return (
        <footer className="mt-16">
            {/* Newsletter card: sits half on the page, half on the navy footer */}
            <div className="relative px-4">
                <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-brand-navy" />
                <div className="relative mx-auto flex max-w-7xl flex-col gap-6 rounded-2xl bg-promo-red px-6 py-8 sm:px-12 md:flex-row md:items-center md:justify-between">
                    <h2 className="text-3xl font-extrabold uppercase leading-tight text-white sm:text-4xl">
                        Stay up to date about
                        <br />
                        our latest offers
                    </h2>
                    <NewsletterForm />
                </div>
            </div>

            <div className="bg-brand-navy px-4 pb-8 pt-12 text-white">
                <div className="mx-auto max-w-6xl">
                    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
                        <div>
                            <Link href="/" className="flex items-center gap-2">
                                <Image
                                    src="/images/Logo-pic.svg"
                                    alt=""
                                    width={40}
                                    height={43}
                                    className="h-10 w-auto"
                                />
                                <span className="flex flex-col leading-none">
                                    <span className="text-lg font-bold tracking-wide text-white">OYINGOLD</span>
                                    <span className="mt-1 text-[10px] font-semibold tracking-[0.3em] text-brand-red">RETAIL</span>
                                </span>
                            </Link>
                            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/70">
                                We have fresh, quality ingredients and food items that delight
                                your taste buds and nourish your body.
                            </p>
                            <div className="mt-5 flex items-center gap-2">
                                {SOCIALS.map(({ label, href, icon }) => (
                                    <a
                                        key={label}
                                        href={href}
                                        aria-label={label}
                                        className="flex size-7 items-center justify-center rounded-full bg-brand-red text-white transition hover:opacity-80"
                                    >
                                        <HugeiconsIcon icon={icon} size={14} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {LINK_COLUMNS.map((col) => (
                            <nav key={col.heading} aria-label={col.heading}>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-red">
                                    {col.heading}
                                </p>
                                <ul className="mt-5 space-y-3 text-sm text-white/70">
                                    {col.links.map((l) => (
                                        <li key={l.label}>
                                            <Link href={l.href} className="transition hover:text-white">
                                                {l.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        ))}
                    </div>

                    <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/20 pt-6 sm:flex-row">
                        <p className="text-xs text-white/70">
                            Oyingold Retail © {new Date().getFullYear()}, All Rights Reserved
                        </p>
                        <ul className="flex flex-wrap items-center justify-center gap-3">
                            {PAYMENT_BADGES.map((b) => (
                                <li key={b.label}>
                                    <FontAwesomeIcon
                                        icon={b.icon}
                                        className="h-7 w-auto text-white"
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    )
}