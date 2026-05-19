import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  ArrowRight,
  BadgeCheck,
  CircleCheckBig,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react'

const BENEFITS = [
  'Access to shared subscription groups',
  'Escrow transaction protection',
  'Join trusted communities',
  'Trust score system',
  'Dispute support',
  'Priority support',
]

const COMPARISON = [
  { label: 'Free guest', value: 'Browse only', note: 'View groups and explore the platform' },
  { label: 'Student member', value: '29,000 VND/month', note: 'Join groups, use escrow, and access support' },
  { label: 'Group owner', value: 'Member fee + earnings', note: 'Create groups and receive payouts' },
]

const FAQS = [
  {
    q: 'Why is membership required?',
    a: 'Membership helps keep EduShare safe and sustainable. It unlocks access to group joining, escrow protection, trust scores, and dispute support.',
  },
  {
    q: 'Can I still explore groups without paying?',
    a: 'Yes. Guests can browse groups and check trust scores, but joining groups requires an active student membership.',
  },
  {
    q: 'What does the 29k/month include?',
    a: 'The monthly fee covers access to shared groups, escrow-based protection, dispute handling, and priority support for students.',
  },
]

export default function PricingPage() {
  return (
    <div className='min-h-screen  from-white via-slate-50 to-indigo-50/40 '>
      <section className='mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24'>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className='text-center'>
          <span className='inline-flex items-center gap-2 rounded-full border border-indigo-100  px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm'>
            <Sparkles className='h-4 w-4' /> Student membership pricing
          </span>
          <h1 className='mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl'>
            Simple monthly membership for students
          </h1>
          <p className='mx-auto mt-4 max-w-2xl text-lg leading-relaxed '>
            EduShare keeps shared subscriptions safer and easier to manage with a friendly community-first membership model.
          </p>
        </motion.div>

        <div className='mt-12 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]'>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className='rounded-[2rem] border border-indigo-100  p-8 shadow-lg shadow-slate-100'
          >
            <div className='flex items-start justify-between gap-4'>
              <div>
                <p className='text-sm font-semibold uppercase tracking-[0.2em] text-sky-600'>Main plan</p>
                <h2 className='mt-2 text-3xl font-bold '>29,000 VND / month</h2>
              </div>
              <div className='rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600'>Most popular</div>
            </div>

            <p className='mt-4 '>
              Designed for students who want safe access to shared subscriptions without the stress of manual group coordination.
            </p>

            <div className='mt-6 space-y-3'>
              {BENEFITS.map((item) => (
                <div key={item} className='flex items-center gap-3 rounded-2xl  px-4 py-3'>
                  <CircleCheckBig className='h-5 w-5 text-indigo-600' />
                  <span className='text-sm '>{item}</span>
                </div>
              ))}
            </div>

            <Link
              to='/login'
              className='mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 px-6 py-3.5 font-semibold text-white transition-all hover:-translate-y-0.5'
            >
              Join EduShare <ArrowRight className='h-5 w-5' />
            </Link>
          </motion.div>

          <div className='grid gap-5 sm:grid-cols-2'>
            <div className='rounded-[2rem] border border-slate-200  p-6 shadow-sm'>
              <ShieldCheck className='h-6 w-6 text-indigo-600' />
              <h3 className='mt-4 text-lg font-bold'>Escrow protection</h3>
              <p className='mt-2 text-sm leading-relaxed '>Your payment is protected until the group access is confirmed.</p>
            </div>
            <div className='rounded-[2rem] border border-slate-200  p-6 shadow-sm'>
              <Users className='h-6 w-6 text-sky-600' />
              <h3 className='mt-4 text-lg font-bold'>Trusted communities</h3>
              <p className='mt-2 text-sm leading-relaxed '>Join student-friendly groups with clear trust scores and reviews.</p>
            </div>
            <div className='rounded-[2rem] border border-slate-200  p-6 shadow-sm'>
              <BadgeCheck className='h-6 w-6 text-orange-500' />
              <h3 className='mt-4 text-lg font-bold'>Trust score system</h3>
              <p className='mt-2 text-sm leading-relaxed '>See reliability indicators before you join a group.</p>
            </div>
            <div className='rounded-[2rem] border border-slate-200  p-6 shadow-sm'>
              <Star className='h-6 w-6 text-violet-600' />
              <h3 className='mt-4 text-lg font-bold'>Priority support</h3>
              <p className='mt-2 text-sm leading-relaxed '>Get help faster when you need assistance or dispute support.</p>
            </div>
          </div>
        </div>

        <div className='mt-12 rounded-[2rem] border border-slate-200  p-8 shadow-sm'>
          <h2 className='text-2xl font-bold'>Monthly membership comparison</h2>
          <div className='mt-6 grid gap-4 md:grid-cols-3'>
            {COMPARISON.map((item) => (
              <div key={item.label} className='rounded-3xl  p-5'>
                <p className='text-sm font-semibold '>{item.label}</p>
                <div className='mt-2 text-xl font-bold '>{item.value}</div>
                <p className='mt-2 text-sm leading-relaxed '>{item.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className='mt-12 grid gap-8 lg:grid-cols-[1fr_1fr]'>
          <div className='rounded-[2rem] border border-slate-200  p-8 shadow-sm'>
            <div className='flex items-center gap-2 '>
              <HelpCircle className='h-5 w-5 text-orange-500' /> FAQ about membership
            </div>
            <div className='mt-6 space-y-4'>
              {FAQS.map((item) => (
                <div key={item.q} className='rounded-2xl  p-5'>
                  <h3 className='font-semibold '>{item.q}</h3>
                  <p className='mt-2 text-sm leading-relaxed '>{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className='rounded-[2rem] r from-indigo-600 to-sky-500 p-8 text-white shadow-lg shadow-sky-100'>
            <p className='text-sm font-semibold uppercase tracking-[0.2em] text-indigo-100'>Friendly CTA</p>
            <h2 className='mt-3 text-3xl font-bold tracking-tight'>Ready to join a safer student community?</h2>
            <p className='mt-4 max-w-xl leading-relaxed text-white/90'>
              Unlock access to shared groups, trust scores, and escrow protection with one simple monthly membership.
            </p>
            <Link
              to='/login'
              className='mt-8 inline-flex items-center gap-2 rounded-full  px-6 py-3.5 font-semibold text-indigo-700 transition-transform hover:-translate-y-0.5'
            >
              Start membership now <ArrowRight className='h-5 w-5' />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
