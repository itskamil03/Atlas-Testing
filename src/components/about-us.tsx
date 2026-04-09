import { Card, CardContent } from '@/components/ui/card'

export default function AboutUs() {
  return (
    <section id="about" className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2 className="text-4xl font-semibold lg:text-5xl">About ATLAS</h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          ATLAS is a fintech-driven quantitative technology company focused on AI-powered trading automation.
          We build institutional-grade and prop desk systems for Forex, Crypto, and global indices that deliver precision,
          speed, and consistency to active traders.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              title: 'Quantitative Intelligence',
              description:
                'Our models combine machine learning, statistical analysis, and market microstructure data to adapt to changing market regimes.',
            },
            {
              title: 'Automated Execution',
              description:
                'Trade with fully automated signals and execution algorithms designed for consistency across Forex, Crypto, and indices.',
            },
            {
              title: 'Trader Education',
              description:
                'ATLAS Academy helps traders understand algorithmic strategies, risk management, and how to apply AI-driven insights effectively.',
            },
          ].map((item, index) => (
            <Card key={index} className="border">
              <CardContent>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
