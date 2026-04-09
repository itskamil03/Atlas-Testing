import { Card, CardContent } from '@/components/ui/card'

export default function Testimonials() {
  const testimonials = [
    {
      quote: "The signals are incredibly accurate. I've been profitable 3 out of 4 weeks since I started. The WhatsApp delivery is super convenient.",
      name: 'Rajesh Sharma',
      role: 'Forex Trader, Mumbai',
    },
    {
      quote: "Finally, a trading bot that actually works! The daily market summaries save me hours of research. Best investment I've made.",
      name: 'Priya Patel',
      role: 'Crypto Trader, Bangalore',
    },
    {
      quote: "The AI analysis is next level. It catches opportunities I would have completely missed. Game changer for my portfolio.",
      name: 'Amit Kumar',
      role: 'Day Trader, Delhi',
    },
  ]

  return (
    <section className="bg-white dark:bg-slate-950/95 pb-16 pt-16 md:pb-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-slate-950 dark:text-white">Indian Rating</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="shadow-zinc-950/5 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <CardContent className="pt-6">
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="size-5 fill-yellow-400 hover:scale-125 transition-transform" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm italic mb-4">{testimonial.quote}</p>
                <div className="text-sm">
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
