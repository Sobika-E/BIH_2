import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '../app/auth/AuthContext'
import { FormField } from '../components/FormField'

const schema = z
  .object({
    name: z.string().min(2, 'Name is required').max(80),
    department: z.string().min(2, 'Department is required').max(80),
    year: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    rollNumber: z.string().min(2, 'Roll Number is required').max(40),
    email: z.string().email('Enter a valid email'),
    mobileNumber: z
      .string()
      .regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits'),
    password: z
      .string()
      .min(8, 'Minimum 8 characters')
      .regex(/[A-Z]/, 'Must include an uppercase letter')
      .regex(/[a-z]/, 'Must include a lowercase letter')
      .regex(/[0-9]/, 'Must include a number')
      .regex(/[^A-Za-z0-9]/, 'Must include a special character'),
    confirmPassword: z.string().min(8, 'Confirm your password'),
  })
  .refine((v) => v.password === v.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' })

type Values = z.infer<typeof schema>

export function SignupPage() {
  const { signup, login } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { year: 1 },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signup(values)
      // Auto-login after successful signup
      await login(values.email, values.password)
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? 'Signup failed'
      setError('root', { message: msg })
    }
  })

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-neutral-50 to-secondary-50 px-4 py-8">
      <div className="w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <div className="text-xl font-semibold tracking-tight text-neutral-900">Create your student account</div>
          <div className="text-sm text-neutral-600">Single signup only. Everyone starts as a student.</div>
        </div>

        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <FormField label="Name" error={errors.name?.message}>
            <input className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500" {...register('name')} />
          </FormField>
          <FormField label="Department" error={errors.department?.message}>
            <input className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500" {...register('department')} />
          </FormField>

          <FormField label="Year" error={errors.year?.message as string | undefined}>
            <select className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500" {...register('year', { valueAsNumber: true })}>
              <option value={1}>1st year</option>
              <option value={2}>2nd year</option>
              <option value={3}>3rd year</option>
              <option value={4}>4th year</option>
            </select>
          </FormField>

          <FormField label="Roll Number / Unique ID" error={errors.rollNumber?.message}>
            <input className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500" {...register('rollNumber')} />
          </FormField>

          <FormField label="Email" error={errors.email?.message}>
            <input className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500" {...register('email')} />
          </FormField>

          <FormField label="Mobile Number" error={errors.mobileNumber?.message}>
            <input className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500" {...register('mobileNumber')} />
          </FormField>

          <FormField label="Password" error={errors.password?.message}>
            <input type="password" className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500" {...register('password')} />
          </FormField>
          <FormField label="Confirm Password" error={errors.confirmPassword?.message}>
            <input
              type="password"
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
              {...register('confirmPassword')}
            />
          </FormField>

          {errors.root?.message && (
            <div className="rounded-xl border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700 md:col-span-2">
              {errors.root.message}
            </div>
          )}

          <div className="md:col-span-2">
            <button
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-primary-600 to-secondary-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-60"
            >
              {isSubmitting ? 'Creating…' : 'Create account'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-sm text-neutral-600">
          Already have an account?{' '}
          <Link className="font-semibold text-primary-700 hover:underline" to="/login">
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}

