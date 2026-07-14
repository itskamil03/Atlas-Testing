export default function ContactSection() {
  return (
    <section id="contact" className="py-16 md:py-10 bg-white dark:bg-slate-950/95" style={{ zoom: 0.77 }}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Contact</p>
          {/* <h2 className="mt-4 text-4xl font-semibold lg:text-5xl text-slate-950 dark:text-white">Get in Touch</h2> */}
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
            For support, business inquiries, institutional partnerships, and prop desk access, reach out to our team.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-8 shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-slate-950/30">
            <h3 className="text-xl font-semibold text-slate-950 dark:text-white">Support</h3>
            <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
              For product questions, technical help, and account support, email our support team.
            </p>
            
             <a href="mailto:support@atlusindia.com"
              className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-primary/90">
              support@atlusindia.com
            </a>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-8 shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-slate-950/30">
            <h3 className="text-xl font-semibold text-slate-950 dark:text-white">Business</h3>
            <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
              For partnerships, institutional access, and prop desk discussions, contact our business development team.
            </p>
            
              <a href="mailto:business@atlusindia.com"
              className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-primary/90">
              business@atlusindia.com
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}