import { HeroHeader } from '@/components/header'
import { SignIn } from '@clerk/nextjs'

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-background">
            <HeroHeader />
            <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 pt-28 pb-10">
                <SignIn />
            </main>
        </div>
    )
}