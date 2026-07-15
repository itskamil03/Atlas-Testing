'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/logo'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import React from 'react'
import { cn } from '@/lib/utils'
import { ThemeToggleButton } from './ThemeToggleButton'


const menuItems = [
    { name: 'Features', href: '/features' },
    { name: 'Services', href: '/services' },
    { name: 'Academy', href: '/academy' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
]

export const HeroHeader = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)
    const [scrollProgress, setScrollProgress] = React.useState(0)
    const pathname = usePathname()

    const isActiveLink = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

    React.useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight
            setScrollProgress(totalHeight > 0 ? (currentScrollY / totalHeight) * 100 : 0)
            setIsScrolled(currentScrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])
    return (
        <header>
            {/* Scroll progress bar */}
            <div className="fixed top-0 left-0 z-50 h-0.75 w-full bg-transparent">
                <div
                    className="h-full bg-linear-to-r from-green-400 to-emerald-500 transition-all duration-75 ease-out"
                    style={{ width: `${scrollProgress}%` }}
                />
            </div>
            <nav
                data-state={menuState && 'active'}
                className="fixed z-20 w-full px-1">
                <div className={cn('mx-auto mt-2 max-w-6xl px-6 transition-colors duration-300 rounded-2xl border lg:px-8', isScrolled ? 'bg-background/80 backdrop-blur-lg' : 'bg-background/40 backdrop-blur-md')}>
                    <div className="flex flex-wrap items-center justify-between gap-6 py-2.5 lg:gap-0 lg:py-3">
                        <div className="flex w-full shrink-0 justify-between lg:w-auto">
                            <Link
                                href="/"
                                aria-label="home"
                                className="flex items-center">
                                <Logo className="shrink-0 h-9 w-auto sm:h-10" />
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>
                        </div>

                        <div className="hidden lg:flex lg:flex-1 lg:justify-center">
                            <ul className="flex gap-6 whitespace-nowrap text-sm xl:gap-8">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            href={item.href}
                                            aria-current={isActiveLink(item.href) ? 'page' : undefined}
                                            className={cn(
                                                'block duration-150',
                                                isActiveLink(item.href)
                                                    ? 'text-primary font-semibold'
                                                    : 'text-muted-foreground hover:text-accent-foreground'
                                            )}>
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:shrink-0 lg:flex-1 lg:gap-4 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none xl:gap-6 dark:shadow-none dark:lg:bg-transparent">
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-base">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                aria-current={isActiveLink(item.href) ? 'page' : undefined}
                                                className={cn(
                                                    'block duration-150',
                                                    isActiveLink(item.href)
                                                        ? 'text-primary font-semibold'
                                                        : 'text-muted-foreground hover:text-accent-foreground'
                                                )}>
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                                <Button
                                    asChild
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold transition-all duration-100 border-none">
                                    <Link href="/login">
                                         <span>Login</span>
                                    </Link>
                                </Button>
                                <ThemeToggleButton/>
                                <Button
                                    asChild
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold transition-all duration-100 border-none">
                                    <Link href="/signup">
                                         <span>Get Started</span>
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}