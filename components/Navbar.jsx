 'use client'
import { PackageIcon, Search, ShoppingCart, ShoppingCartIcon } from "lucide-react";
import { Moon, Sun } from 'lucide-react'
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useUser, useClerk,UserButton  } from "@clerk/nextjs";
import { useEffect } from "react";
import { assets } from "../assets/assets"

const Navbar = () => {
    
    const {user} = useUser();
    const {openSignIn} = useClerk();
    const router = useRouter();

    // When Clerk user becomes available, notify server to upsert into DB
    useEffect(() => {
        if (!user) return;

        // prepare a payload shape Clerk may expose on the client
        const payload = {
            id: user.id,
            email_addresses: user.emailAddresses ? user.emailAddresses.map(e => ({ email_address: e.emailAddress })) : undefined,
            first_name: user.firstName,
            last_name: user.lastName,
            image_url: user.imageUrl || user.profileImageUrl || null,
            email: user.primaryEmailAddress?.emailAddress || user.email
        };

        // Fire-and-forget
        fetch('/api/clerk/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).catch(err => console.error('sync user failed', err));

    }, [user]);

    const [search, setSearch] = useState('')
    const cartCount = useSelector(state => state.cart.total)
    const [dark, setDark] = useState(false)

    const handleSearch = (e) => {
        e.preventDefault()
        router.push(`/shop?search=${search}`)
    }

    // Dark mode: read preference on mount and persist changes
    useEffect(() => {
        try {
            const stored = localStorage.getItem('theme')
            if (stored) {
                const isDark = stored === 'dark'
                setDark(isDark)
                if (isDark) document.documentElement.classList.add('dark')
                else document.documentElement.classList.remove('dark')
            } else {
                // respect system preference if no stored preference
                const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
                setDark(prefersDark)
                if (prefersDark) document.documentElement.classList.add('dark')
            }
        } catch (e) {
            // ignore in non-browser environments
        }
    }, [])

    const toggleDark = () => {
        try {
            const next = !dark
            setDark(next)
            if (next) {
                document.documentElement.classList.add('dark')
                localStorage.setItem('theme', 'dark')
            } else {
                document.documentElement.classList.remove('dark')
                localStorage.setItem('theme', 'light')
            }
        } catch (e) {
            // ignore
        }
    }

    return (
        <nav className="relative bg-white">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4  transition-all">

                    <Link href="/" className="relative flex items-center gap-3">
                        {/* Logo image (falls back to text if missing) */}
                        <img src={assets.Abulogo.src ?? "/assets/Abulogo.png"} alt="ABU Marketplace" className="w-10 h-10 object-contain" />
                        <div className="text-2xl font-semibold text-slate-700">
                            ABU <span className="text-green-600">Marketplace</span>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600">
                        <Link href="/">Home</Link>
                        <Link href="/shop">Shop</Link>
                        <Link href="/">About</Link>
                        <Link href="/">Contact</Link>

                        <form onSubmit={handleSearch} className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full">
                            <Search size={18} className="text-slate-600" />
                            <input className="w-full bg-transparent outline-none placeholder-slate-600" type="text" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} required />
                        </form>

                        <Link href="/cart" className="relative flex items-center gap-2 text-slate-600">
                            <ShoppingCart size={18} />
                            Cart
                            <button className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">{cartCount}</button>
                        </Link>
                        {/* Dark mode toggle */}
                        <button onClick={toggleDark} aria-label="Toggle dark mode" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                            {dark ? <Sun size={16} /> : <Moon size={16} />}
                        </button>
                    {
                        !user ? (
                             <button  onClick={openSignIn} className="px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full">
                            Login
                        </button>
                        ) : (
                            <UserButton>
                                <UserButton.MenuItems>
                                    <UserButton.Action labelIcon={<ShoppingCartIcon size={16} />} label="Cart" onClick={() => router.push('/cart')} />
                                </UserButton.MenuItems>
                            </UserButton>
                        )
                    }
                        

                    </div>

                    {/* Mobile User Button  */}
                    <div className="sm:hidden">

                        {user ? (
                            <div>
                                <UserButton>
                                    <UserButton.MenuItems>
                                        <UserButton.Action labelIcon={<ShoppingCartIcon size={16} />} label="Cart" onClick={() => router.push('/cart')} />
                                    </UserButton.MenuItems>
                                </UserButton>
                            </div>
                        ) : (
                            <button onClick={openSignIn} className="px-7 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-sm transition text-white rounded-full">
                                Login
                            </button>
                        )}

                        {/* Mobile dark toggle */}
                        <div className="mt-3">
                            <button onClick={toggleDark} aria-label="Toggle dark mode" className="px-3 py-2 rounded-full bg-slate-100 dark:bg-slate-700">
                                {dark ? <Sun size={16} /> : <Moon size={16} />}
                            </button>
                        </div>
                        
                        </div>
                </div>
            </div>
            <hr className="border-gray-300" />
        </nav>
    )
}

export default Navbar