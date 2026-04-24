'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useCartStore } from '@/stores/cart.store';
import { ordersApi } from '@/lib/api/orders.api';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/providers/auth-provider';
import { ApiError } from '@/lib/errors/api-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { cn } from '@/lib/utils';

// ─── Stripe ───────────────────────────────────────────────────────────────────

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
);

// ─── Types ────────────────────────────────────────────────────────────────────

type ShippingOption = {
  method: 'PICKUP' | 'COURIER';
  label: string;
  description: string;
  priceCents: number;
};

type Step = 'shipping' | 'address' | 'payment';

// ─── Schema ───────────────────────────────────────────────────────────────────

const addressSchema = z.object({
  email: z.email('Invalid email.'),
  firstName: z.string().min(1, 'Required.').max(100),
  lastName: z.string().min(1, 'Required.').max(100),
  addressLine1: z.string().min(1, 'Required.').max(200),
  addressLine2: z.string().max(200).default(''),
  city: z.string().min(1, 'Required.').max(100),
  postalCode: z.string().min(1, 'Required.').max(20),
  country: z
    .string()
    .length(2, 'Use 2-letter country code (e.g. PL).')
    .transform((v) => v.toUpperCase()),
  notes: z.string().max(1000).default(''),
});

type AddressValues = z.infer<typeof addressSchema>;

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS: { key: Step; label: string }[] = [
  { key: 'shipping', label: 'Shipping' },
  { key: 'address', label: 'Address' },
  { key: 'payment', label: 'Payment' },
];

function StepIndicator({ current }: { current: Step }) {
  const currentIdx = STEPS.findIndex((s) => s.key === current);
  return (
    <div className='flex items-center gap-2 mb-8'>
      {STEPS.map((step, i) => (
        <div key={step.key} className='flex items-center gap-2'>
          <div
            className={cn(
              'size-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
              i < currentIdx
                ? 'bg-teal-600 text-white'
                : i === currentIdx
                  ? 'bg-teal-600 text-white ring-2 ring-teal-200'
                  : 'bg-muted text-muted-foreground',
            )}
          >
            {i < currentIdx ? (
              <span className='icon-[mingcute--check-line] size-3.5' />
            ) : (
              i + 1
            )}
          </div>
          <span
            className={cn(
              'text-sm',
              i === currentIdx ? 'font-medium' : 'text-muted-foreground',
            )}
          >
            {step.label}
          </span>
          {i < STEPS.length - 1 && (
            <div
              className={cn(
                'w-8 h-px mx-1',
                i < currentIdx ? 'bg-teal-600' : 'bg-border',
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Order summary sidebar ────────────────────────────────────────────────────

function OrderSummary({
  shippingOption,
}: {
  shippingOption: ShippingOption | null;
}) {
  const { items, totalCents } = useCartStore();
  const currency = items[0]?.currency ?? 'PLN';
  const subtotal = totalCents();
  const shipping = shippingOption?.priceCents ?? 0;
  const total = subtotal + shipping;

  return (
    <div className='rounded-xl border p-6 sticky top-24'>
      <h2 className='text-sm font-semibold mb-4'>Order summary</h2>
      <div className='flex flex-col gap-2 text-sm mb-4'>
        {items.map((item) => (
          <div key={item.variantId} className='flex justify-between'>
            <span className='text-muted-foreground truncate mr-2'>
              {item.productName} ×{item.quantity}
            </span>
            <span className='shrink-0'>
              {((item.priceCents * item.quantity) / 100).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <div className='border-t pt-3 flex flex-col gap-1.5 text-sm'>
        <div className='flex justify-between text-muted-foreground'>
          <span>Subtotal</span>
          <span>{(subtotal / 100).toFixed(2)}</span>
        </div>
        <div className='flex justify-between text-muted-foreground'>
          <span>Shipping</span>
          <span>
            {shipping === 0 ? 'Free' : `${(shipping / 100).toFixed(2)}`}
          </span>
        </div>
        <div className='flex justify-between font-bold text-base pt-1 border-t mt-1'>
          <span>Total</span>
          <span>
            {(total / 100).toFixed(2)} {currency}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Step 1: Shipping ─────────────────────────────────────────────────────────

function ShippingStep({
  selected,
  onSelect,
  onNext,
}: {
  selected: ShippingOption | null;
  onSelect: (o: ShippingOption) => void;
  onNext: () => void;
}) {
  const options: ShippingOption[] = [
    {
      method: 'PICKUP',
      label: 'Store pickup',
      description: 'Pick up at our store in Warsaw',
      priceCents: 0,
    },
    {
      method: 'COURIER',
      label: 'Courier delivery',
      description: 'Delivery within 2-3 business days',
      priceCents: 1500,
    },
  ];

  return (
    <div>
      <h2 className='text-lg font-semibold mb-4'>Choose shipping method</h2>
      <div className='flex flex-col gap-3 mb-6'>
        {options.map((opt) => (
          <button
            key={opt.method}
            type='button'
            onClick={() => onSelect(opt)}
            className={cn(
              'flex items-center justify-between rounded-xl border p-4 text-left transition-colors',
              selected?.method === opt.method
                ? 'border-teal-600 bg-teal-50'
                : 'hover:bg-muted/40',
            )}
          >
            <div className='flex items-center gap-3'>
              <div
                className={cn(
                  'size-4 rounded-full border-2 transition-colors',
                  selected?.method === opt.method
                    ? 'border-teal-600 bg-teal-600'
                    : 'border-muted-foreground',
                )}
              />
              <div>
                <p className='text-sm font-medium'>{opt.label}</p>
                <p className='text-xs text-muted-foreground'>
                  {opt.description}
                </p>
              </div>
            </div>
            <span className='text-sm font-semibold shrink-0 ml-4'>
              {opt.priceCents === 0
                ? 'Free'
                : `${(opt.priceCents / 100).toFixed(2)} PLN`}
            </span>
          </button>
        ))}
      </div>
      <Button
        onClick={onNext}
        disabled={!selected}
        className='w-full bg-teal-600 hover:bg-teal-700'
      >
        Continue to address
      </Button>
    </div>
  );
}

// ─── Step 2: Address ──────────────────────────────────────────────────────────

function AddressStep({
  defaultEmail,
  onNext,
  onBack,
}: {
  defaultEmail: string;
  onNext: (data: AddressValues) => void;
  onBack: () => void;
}) {
  const form = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      email: defaultEmail ?? '',
      firstName: '',
      lastName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      postalCode: '',
      country: 'PL',
      notes: '',
    },
  });

  return (
    <div>
      <h2 className='text-lg font-semibold mb-4'>Shipping address</h2>
      <form
        onSubmit={form.handleSubmit(onNext)}
        noValidate
        className='flex flex-col gap-4'
      >
        <FieldGroup className='gap-4'>
          <Controller
            name='email'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='email'>Email</FieldLabel>
                <Input {...field} id='email' type='email' />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <div className='grid grid-cols-2 gap-4'>
            <Controller
              name='firstName'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='firstName'>First name</FieldLabel>
                  <Input {...field} id='firstName' />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name='lastName'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='lastName'>Last name</FieldLabel>
                  <Input {...field} id='lastName' />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
          <Controller
            name='addressLine1'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='addressLine1'>Address</FieldLabel>
                <Input
                  {...field}
                  id='addressLine1'
                  placeholder='Street and number'
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name='addressLine2'
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor='addressLine2'>
                  Apartment{' '}
                  <span className='text-muted-foreground font-normal'>
                    (optional)
                  </span>
                </FieldLabel>
                <Input {...field} id='addressLine2' />
              </Field>
            )}
          />
          <div className='grid grid-cols-2 gap-4'>
            <Controller
              name='city'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='city'>City</FieldLabel>
                  <Input {...field} id='city' />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name='postalCode'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='postalCode'>Postal code</FieldLabel>
                  <Input {...field} id='postalCode' />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
          <Controller
            name='country'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='country'>Country code</FieldLabel>
                <Input
                  {...field}
                  id='country'
                  maxLength={2}
                  className='uppercase w-24'
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name='notes'
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor='notes'>
                  Notes{' '}
                  <span className='text-muted-foreground font-normal'>
                    (optional)
                  </span>
                </FieldLabel>
                <textarea
                  {...field}
                  id='notes'
                  rows={2}
                  className='flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm resize-y focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                />
              </Field>
            )}
          />
        </FieldGroup>

        <div className='flex gap-3 mt-2'>
          <Button
            type='submit'
            className='flex-1 bg-teal-600 hover:bg-teal-700'
          >
            Continue to payment
          </Button>
          <Button type='button' variant='outline' onClick={onBack}>
            Back
          </Button>
        </div>
      </form>
    </div>
  );
}

// ─── Step 3: Payment form (inside Elements) ───────────────────────────────────

function PaymentForm({
  orderId,
  onBack,
  onSuccess,
}: {
  orderId: string;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isPaying, setIsPaying] = useState(false);

  async function handlePay() {
    if (!stripe || !elements) return;
    setIsPaying(true);
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders/${orderId}?paid=1`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message ?? 'Payment failed.');
      } else {
        onSuccess();
      }
    } finally {
      setIsPaying(false);
    }
  }

  return (
    <div>
      <h2 className='text-lg font-semibold mb-4'>Payment</h2>
      <div className='mb-6'>
        <PaymentElement />
      </div>
      <div className='flex gap-3'>
        <Button
          onClick={handlePay}
          disabled={isPaying || !stripe}
          className='flex-1 bg-teal-600 hover:bg-teal-700'
        >
          {isPaying ? 'Processing…' : 'Pay now'}
        </Button>
        <Button variant='outline' onClick={onBack} disabled={isPaying}>
          Back
        </Button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>('shipping');
  const [shippingOption, setShippingOption] = useState<ShippingOption | null>(
    null,
  );
  const [addressData, setAddressData] = useState<AddressValues | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  if (items.length === 0) {
    return (
      <div className='max-w-4xl mx-auto px-4 py-24 flex flex-col items-center gap-4'>
        <p className='text-muted-foreground'>Your cart is empty.</p>
        <Button asChild variant='outline'>
          <a href='/products'>Browse products</a>
        </Button>
      </div>
    );
  }

  async function handleAddressNext(data: AddressValues) {
    console.log('address data:', data); // ← dodaj
    console.log('shipping:', shippingOption); // ← dodaj
    if (!shippingOption) return;
    setAddressData(data);
    setIsCreatingOrder(true);

    try {
      // 1. Utwórz zamówienie
      const order = await ordersApi.create({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || undefined,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
        shippingMethod: shippingOption.method,
        notes: data.notes || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
      });

      // 2. Pobierz PaymentIntent
      const { clientSecret: secret } = await apiClient<{
        clientSecret: string;
        publishableKey: string;
      }>(`/payments/create-intent/${order.id}`, { method: 'POST' });

      setOrderId(order.id);
      setClientSecret(secret);
      setStep('payment');
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.firstMessage : 'Something went wrong.',
      );
    } finally {
      setIsCreatingOrder(false);
    }
  }

  function handlePaymentSuccess() {
    clearCart();
    toast.success('Payment successful!');
    router.push(`/orders/${orderId}?new=1`);
  }

  return (
    <div className='max-w-4xl mx-auto px-4 py-12'>
      <h1 className='text-2xl font-bold tracking-tight mb-2'>Checkout</h1>
      <StepIndicator current={step} />

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Main content */}
        <div className='lg:col-span-2'>
          {step === 'shipping' && (
            <ShippingStep
              selected={shippingOption}
              onSelect={setShippingOption}
              onNext={() => setStep('address')}
            />
          )}

          {step === 'address' && (
            <AddressStep
              defaultEmail={user?.email ?? ''}
              onNext={handleAddressNext}
              onBack={() => setStep('shipping')}
            />
          )}

          {step === 'payment' && clientSecret && orderId && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: { theme: 'stripe' },
              }}
            >
              <PaymentForm
                orderId={orderId}
                onBack={() => setStep('address')}
                onSuccess={handlePaymentSuccess}
              />
            </Elements>
          )}

          {isCreatingOrder && (
            <div className='flex items-center gap-2 text-sm text-muted-foreground mt-4'>
              <span className='icon-[mingcute--loading-line] size-4 animate-spin' />
              Creating order…
            </div>
          )}
        </div>

        {/* Summary */}
        <div className='lg:col-span-1'>
          <OrderSummary shippingOption={shippingOption} />
        </div>
      </div>
    </div>
  );
}
