import { SignIn } from '@clerk/nextjs'

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-background">
            <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 pb-10">
                <SignIn />
            </main>
        </div>
    )
}