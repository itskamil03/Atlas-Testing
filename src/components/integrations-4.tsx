import { Gemini, Replit, MagicUI, VSCodium, MediaWiki, GooglePaLM } from '@/components/logos'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function IntegrationsSection() {
    return (
        <section>
            <div className="bg-white dark:bg-background py-24 md:py-32">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="relative mx-auto flex max-w-sm items-center justify-between">
                        <div className="space-y-6">
                            <IntegrationCard position="left-top">
                                <Gemini />
                            </IntegrationCard>
                            <IntegrationCard position="left-middle">
                                <Replit />
                            </IntegrationCard>
                            <IntegrationCard position="left-bottom">
                                <MagicUI />
                            </IntegrationCard>
                        </div>
                        <div
                            role="presentation"
                            className="absolute inset-1/3 bg-[radial-gradient(var(--dots-color)_1px,transparent_1px)] opacity-50 [--dots-color:black] bg-size-[16px_16px] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:[--dots-color:white]"></div>

                        <div className="space-y-6">
                            <IntegrationCard position="right-top">
                                <VSCodium />
                            </IntegrationCard>
                            <IntegrationCard position="right-middle">
                                <MediaWiki />
                            </IntegrationCard>
                            <IntegrationCard position="right-bottom">
                                <GooglePaLM />
                            </IntegrationCard>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

const IntegrationCard = ({ children, className, position, isCenter = false }: { children: React.ReactNode; className?: string; position?: 'left-top' | 'left-middle' | 'left-bottom' | 'right-top' | 'right-middle' | 'right-bottom'; isCenter?: boolean }) => {
    return (
        <div className={cn('bg-background relative flex size-12 rounded-xl border dark:bg-transparent', className)}>
            <div className={cn('relative z-20 m-auto size-fit *:size-6', isCenter && '*:size-8')}>{children}</div>
            {position && !isCenter && (
                <div
                    className={cn(
                        'bg-linear-to-r to-muted-foreground/25 absolute z-10 h-px',
                        position === 'left-top' && 'left-full top-1/2 w-32.5 origin-left rotate-25',
                        position === 'left-middle' && 'left-full top-1/2 w-30 origin-left',
                        position === 'left-bottom' && 'left-full top-1/2 w-32.5 origin-left -rotate-25',
                        position === 'right-top' && 'bg-linear-to-l right-full top-1/2 w-32.5 origin-right -rotate-25',
                        position === 'right-middle' && 'bg-linear-to-l right-full top-1/2 w-30 origin-right',
                        position === 'right-bottom' && 'bg-linear-to-l right-full top-1/2 w-32.5 origin-right rotate-25'
                    )}
                />
            )}
        </div>
    )
}
