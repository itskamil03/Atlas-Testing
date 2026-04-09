import { HeroHeader } from '@/components/header'
import { SignUp } from '@clerk/nextjs'

export default function SignupPage() {
    return (
        <div className="min-h-screen bg-background">
            <HeroHeader />
            <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 pt-28 pb-10">
                <SignUp />
            </main>
        </div>
    )
}