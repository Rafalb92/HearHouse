'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  adminProductsApi,
  type ProductCategory,
} from '@/lib/api/admin-products.api';
import { ApiError } from '@/lib/errors/api-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { uploadApi } from '@/lib/api/upload.api';
// ─── Schema ──────────────────────────────────────────────────────────────────

const variantSchema = z.object({
  sku: z.string().min(1, 'Required.').max(100),
  colorName: z.string().min(1, 'Required.').max(100),
  colorHex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color (#RRGGBB).'),
  finish: z.string().optional(),
  priceDeltaCents: z.number().int().default(0),
  stock: z.number().int().min(0, 'Must be 0 or more.'),
});

const schema = z.object({
  brand: z.string().min(1, 'Required.').max(100),
  model: z.string().min(1, 'Required.').max(100),
  name: z.string().max(255).optional(),
  category: z.enum([
    'IN_EAR',
    'ON_EAR',
    'OVER_EAR',
    'OPEN_BACK',
    'TRUE_WIRELESS',
    'GAMING',
  ]),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('DRAFT'),
  basePriceCents: z.number().int().min(0, 'Must be 0 or more.'),
  currency: z.string().length(3).default('PLN'),
  shortDescription: z.string().max(500).optional(),
  description: z.string().optional(),
  tags: z.string().optional(),
  featured: z.boolean().default(false),
  seoTitle: z.string().max(255).optional(),
  seoDescription: z.string().max(500).optional(),
  variants: z.array(variantSchema).min(1),
  specs: z.record(z.string(), z.unknown()).or(z.string()).optional(),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

// ─── Component ───────────────────────────────────────────────────────────────

type PendingImage = {
  file: File;
  preview: string;
  uploading: boolean;
  uploaded?: { url: string; publicId: string; width: number; height: number };
  error?: string;
};

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'IN_EAR', label: 'In-Ear' },
  { value: 'ON_EAR', label: 'On-Ear' },
  { value: 'OVER_EAR', label: 'Over-Ear' },
  { value: 'OPEN_BACK', label: 'Open-Back' },
  { value: 'TRUE_WIRELESS', label: 'True Wireless (TWS)' },
  { value: 'GAMING', label: 'Gaming' },
];

export default function NewProductPage() {
  const router = useRouter();
  const [images, setImages] = useState<PendingImage[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<FormInput, any, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      brand: '',
      model: '',
      name: '',
      category: 'IN_EAR',
      status: 'DRAFT',
      basePriceCents: 0,
      currency: 'PLN',
      shortDescription: '',
      description: '',
      tags: '',
      featured: false,
      seoTitle: '',
      seoDescription: '',
      variants: [
        {
          sku: '',
          colorName: '',
          colorHex: '#000000',
          finish: '',
          priceDeltaCents: 0,
          stock: 0,
        },
      ],
    },
    mode: 'onTouched',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'variants',
  });

  // ─── Image handling ─────────────────────────────────────────────────────────

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const newImages: PendingImage[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
    }));

    setImages((prev) => [...prev, ...newImages]);
    e.target.value = '';
  }

  async function uploadAllImages(productId: string) {
    // pobierz CSRF token raz dla wszystkich zdjęć
    const csrfToken = await uploadApi.getCsrfToken();
    console.log('csrf token:', csrfToken);

    for (let i = 0; i < images.length; i++) {
      const img = images[i];

      if (img.uploaded) {
        await adminProductsApi.addImage(productId, {
          url: img.uploaded.url,
          publicId: img.uploaded.publicId,
          width: img.uploaded.width,
          height: img.uploaded.height,
          sortOrder: i,
        });
        continue;
      }

      setImages((prev) =>
        prev.map((p, idx) => (idx === i ? { ...p, uploading: true } : p)),
      );

      try {
        const result = await uploadApi.uploadProductImage(img.file, csrfToken);
        await adminProductsApi.addImage(productId, {
          url: result.url,
          publicId: result.publicId,
          width: result.width,
          height: result.height,
          sortOrder: i,
        });
        setImages((prev) =>
          prev.map((p, idx) =>
            idx === i ? { ...p, uploading: false, uploaded: result } : p,
          ),
        );
      } catch (err) {
        setImages((prev) =>
          prev.map((p, idx) =>
            idx === i ? { ...p, uploading: false, error: 'Upload failed.' } : p,
          ),
        );
      }
    }
  }

  // ─── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit(data: FormOutput) {
    console.log('sending:', JSON.stringify(data, null, 2));
    setIsSaving(true);
    try {
      const product = await adminProductsApi.create({
        brand: data.brand,
        model: data.model,
        name: data.name || undefined,
        category: data.category,
        status: data.status,
        basePriceCents: data.basePriceCents,
        currency: data.currency,
        shortDescription: data.shortDescription || undefined,
        description: data.description || undefined,
        tags: data.tags
          ? data.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        featured: data.featured,
        seoTitle: data.seoTitle || undefined,
        seoDescription: data.seoDescription || undefined,
        variants: data.variants,
        specs:
          typeof data.specs === 'string'
            ? (() => {
                try {
                  return JSON.parse(data.specs);
                } catch {
                  return undefined;
                }
              })()
            : data.specs,
      });

      if (images.length > 0) {
        await uploadAllImages(product.id);
      }

      toast.success('Product created.');
      router.push('/admin/products');
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.firstMessage : 'Something went wrong.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className='max-w-3xl mx-auto'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-xl font-bold tracking-tight'>Add product</h1>
        <p className='text-sm text-muted-foreground mt-1'>
          Fill in the details below. Start with Draft to save without
          publishing.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
        <div className='flex flex-col gap-8'>
          {/* ── Basic info ── */}
          <section className='rounded-lg border p-6'>
            <h2 className='text-sm font-semibold mb-5'>Basic information</h2>
            <FieldGroup className='gap-5'>
              <div className='grid grid-cols-2 gap-4'>
                <Controller
                  name='brand'
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor='p-brand'>Brand</FieldLabel>
                      <Input {...field} id='p-brand' placeholder='Sony' />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name='model'
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor='p-model'>Model</FieldLabel>
                      <Input {...field} id='p-model' placeholder='WH-1000XM6' />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <Controller
                name='name'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='p-name'>
                      Display name{' '}
                      <span className='text-muted-foreground font-normal'>
                        (optional — defaults to Brand + Model)
                      </span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id='p-name'
                      placeholder='Sony WH-1000XM6'
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <div className='grid grid-cols-2 gap-4'>
                <Controller
                  name='category'
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor='p-category'>Category</FieldLabel>
                      <select
                        {...field}
                        id='p-category'
                        className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name='status'
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor='p-status'>Status</FieldLabel>
                      <select
                        {...field}
                        id='p-status'
                        className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                      >
                        <option value='DRAFT'>Draft</option>
                        <option value='ACTIVE'>Active</option>
                        <option value='ARCHIVED'>Archived</option>
                      </select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <Controller
                name='shortDescription'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='p-short'>Short description</FieldLabel>
                    <Input
                      {...field}
                      id='p-short'
                      placeholder='One-liner for product cards'
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name='description'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='p-desc'>Full description</FieldLabel>
                    <textarea
                      {...field}
                      id='p-desc'
                      rows={4}
                      placeholder='Detailed product description…'
                      className='flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm resize-y focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </section>

          {/* ── Pricing ── */}
          <section className='rounded-lg border p-6'>
            <h2 className='text-sm font-semibold mb-5'>Pricing</h2>
            <div className='grid grid-cols-2 gap-4'>
              <Controller
                name='basePriceCents'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='p-price'>
                      Base price (in grosz / cents)
                    </FieldLabel>
                    <Input
                      {...field}
                      id='p-price'
                      type='number'
                      min={0}
                      placeholder='24900 = 249.00'
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                    {field.value > 0 && (
                      <p className='text-xs text-muted-foreground'>
                        = {(Number(field.value) / 100).toFixed(2)}{' '}
                        {form.watch('currency')}
                      </p>
                    )}
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name='currency'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='p-currency'>Currency</FieldLabel>
                    <Input
                      {...field}
                      id='p-currency'
                      placeholder='PLN'
                      maxLength={3}
                      className='uppercase'
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </section>

          {/* ── Variants ── */}
          <section className='rounded-lg border p-6'>
            <div className='flex items-center justify-between mb-5'>
              <h2 className='text-sm font-semibold'>Variants</h2>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() =>
                  append({
                    sku: '',
                    colorName: '',
                    colorHex: '#000000',
                    finish: '',
                    priceDeltaCents: 0,
                    stock: 0,
                  })
                }
              >
                <span className='icon-[mingcute--add-line] size-4 mr-1' />
                Add variant
              </Button>
            </div>

            <div className='flex flex-col gap-4'>
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className='rounded-md border p-4 bg-muted/20'
                >
                  <div className='flex items-center justify-between mb-3'>
                    <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                      Variant {index + 1}
                    </p>
                    {fields.length > 1 && (
                      <button
                        type='button'
                        onClick={() => remove(index)}
                        className='text-xs text-destructive hover:underline'
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className='grid grid-cols-2 gap-3'>
                    <Controller
                      name={`variants.${index}.sku`}
                      control={form.control}
                      render={({ field: f, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={`v-sku-${index}`}>
                            SKU
                          </FieldLabel>
                          <Input
                            {...f}
                            id={`v-sku-${index}`}
                            placeholder='SONY-XM6-BLK'
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                    <Controller
                      name={`variants.${index}.colorName`}
                      control={form.control}
                      render={({ field: f, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={`v-color-${index}`}>
                            Color name
                          </FieldLabel>
                          <Input
                            {...f}
                            id={`v-color-${index}`}
                            placeholder='Midnight Black'
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                    <Controller
                      name={`variants.${index}.colorHex`}
                      control={form.control}
                      render={({ field: f, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={`v-hex-${index}`}>
                            Color hex
                          </FieldLabel>
                          <div className='flex items-center gap-2'>
                            <input
                              type='color'
                              value={f.value}
                              onChange={(e) => f.onChange(e.target.value)}
                              className='size-9 rounded border border-input cursor-pointer p-0.5 bg-transparent'
                            />
                            <Input
                              value={f.value}
                              onChange={(e) => f.onChange(e.target.value)}
                              id={`v-hex-${index}`}
                              placeholder='#000000'
                              className='font-mono'
                            />
                          </div>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                    <Controller
                      name={`variants.${index}.stock`}
                      control={form.control}
                      render={({ field: f, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={`v-stock-${index}`}>
                            Stock
                          </FieldLabel>
                          <Input
                            {...f}
                            id={`v-stock-${index}`}
                            type='number'
                            min={0}
                            placeholder={'50'}
                            onChange={(e) => f.onChange(e.target.valueAsNumber)}
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                    <Controller
                      name={`variants.${index}.priceDeltaCents`}
                      control={form.control}
                      render={({ field: f, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={`v-delta-${index}`}>
                            Price delta (cents)
                          </FieldLabel>
                          <Input
                            {...f}
                            id={`v-delta-${index}`}
                            type='number'
                            placeholder='0'
                            onChange={(e) => f.onChange(e.target.valueAsNumber)}
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                    <Controller
                      name={`variants.${index}.finish`}
                      control={form.control}
                      render={({ field: f }) => (
                        <Field>
                          <FieldLabel htmlFor={`v-finish-${index}`}>
                            Finish{' '}
                            <span className='text-muted-foreground font-normal'>
                              (optional)
                            </span>
                          </FieldLabel>
                          <select
                            {...f}
                            id={`v-finish-${index}`}
                            className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm'
                          >
                            <option value=''>— none —</option>
                            <option value='matte'>Matte</option>
                            <option value='glossy'>Glossy</option>
                            <option value='satin'>Satin</option>
                            <option value='metallic'>Metallic</option>
                          </select>
                        </Field>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
          {/* ── Specs ── */}
          <section className='rounded-lg border p-6'>
            <h2 className='text-sm font-semibold mb-2'>Specifications</h2>
            <p className='text-xs text-muted-foreground mb-4'>
              JSON specs — structure depends on category.
            </p>
            <Controller
              name='specs'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='p-specs'>Specs (JSON)</FieldLabel>
                  <textarea
                    id='p-specs'
                    rows={14}
                    value={
                      field.value
                        ? typeof field.value === 'string'
                          ? field.value
                          : JSON.stringify(field.value, null, 2)
                        : ''
                    }
                    onChange={(e) => {
                      try {
                        field.onChange(JSON.parse(e.target.value));
                      } catch {
                        field.onChange(e.target.value);
                      }
                    }}
                    placeholder='{ "formFactor": "over-ear", "battery": { ... } }'
                    className='font-mono text-xs flex w-full rounded-md border border-input bg-transparent px-3 py-2 shadow-sm resize-y focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </section>

          {/* ── Images ── */}
          <section className='rounded-lg border p-6'>
            <h2 className='text-sm font-semibold mb-2'>Images</h2>
            <p className='text-xs text-muted-foreground mb-4'>
              First image will be the main thumbnail. Images are uploaded to
              Cloudinary after saving.
            </p>

            <div className='flex flex-wrap gap-3 mb-4'>
              {images.map((img, i) => (
                <div
                  key={i}
                  className='relative size-24 rounded-md overflow-hidden border bg-muted'
                >
                  <img
                    src={img.preview}
                    alt=''
                    className='size-full object-cover'
                  />
                  {img.uploading && (
                    <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
                      <span className='icon-[mingcute--loading-line] size-5 text-white animate-spin' />
                    </div>
                  )}
                  {img.error && (
                    <div className='absolute inset-0 bg-destructive/70 flex items-center justify-center'>
                      <span className='icon-[mingcute--close-line] size-5 text-white' />
                    </div>
                  )}
                  {i === 0 && (
                    <span className='absolute top-1 left-1 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded'>
                      Main
                    </span>
                  )}
                  <button
                    type='button'
                    onClick={() => {
                      URL.revokeObjectURL(img.preview);
                      setImages((prev) => prev.filter((_, idx) => idx !== i));
                    }}
                    className='absolute top-1 right-1 size-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80'
                  >
                    <span className='icon-[mingcute--close-line] size-3' />
                  </button>
                </div>
              ))}

              <label className='size-24 rounded-md border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-muted-foreground/60 transition-colors'>
                <span className='icon-[mingcute--add-line] size-6 text-muted-foreground' />
                <span className='text-xs text-muted-foreground'>Add image</span>
                <input
                  type='file'
                  multiple
                  accept='image/jpeg,image/png,image/webp,image/avif'
                  className='sr-only'
                  onChange={handleFileSelect}
                />
              </label>
            </div>
          </section>

          {/* ── Tags & SEO ── */}
          <section className='rounded-lg border p-6'>
            <h2 className='text-sm font-semibold mb-5'>Tags & SEO</h2>
            <FieldGroup className='gap-4'>
              <Controller
                name='tags'
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor='p-tags'>Tags</FieldLabel>
                    <Input
                      {...field}
                      id='p-tags'
                      placeholder='tws, sport, budget (comma separated)'
                    />
                  </Field>
                )}
              />
              <Controller
                name='featured'
                control={form.control}
                render={({ field }) => (
                  <label className='flex items-center gap-2 cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={field.value}
                      onChange={field.onChange}
                      className='rounded border-input size-4'
                    />
                    <span className='text-sm'>Featured product</span>
                  </label>
                )}
              />
              <Controller
                name='seoTitle'
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor='p-seo-title'>
                      SEO title{' '}
                      <span className='text-muted-foreground font-normal'>
                        (optional)
                      </span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id='p-seo-title'
                      placeholder='Override meta title'
                    />
                  </Field>
                )}
              />
              <Controller
                name='seoDescription'
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor='p-seo-desc'>
                      SEO description{' '}
                      <span className='text-muted-foreground font-normal'>
                        (optional)
                      </span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id='p-seo-desc'
                      placeholder='Override meta description'
                    />
                  </Field>
                )}
              />
            </FieldGroup>
          </section>

          {/* ── Actions ── */}
          <div className='flex gap-3 pb-8'>
            <Button
              type='submit'
              disabled={isSaving}
              className='flex-1 sm:flex-none sm:px-8'
            >
              {isSaving ? 'Saving…' : 'Create product'}
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={() => router.push('/admin/products')}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
