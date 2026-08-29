/**
 * Multi-step "Post a listing" form (create & edit).
 * Steps: Basics -> Details -> Location -> Photos -> Review.
 * - Autosaves progress to localStorage so a half-finished listing survives a
 *   refresh (client-side draft).
 * - "Save as draft" stores it server-side but hidden from search; "Publish"
 *   makes it live.
 * - Photos are compressed in the browser before upload.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, Upload, X, Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Input from '../components/ui/Input';
import LocationPicker, { type PickedLocation } from '../components/listing/LocationPicker';
import { createListing, updateListing, getProperty, type ListingPayload } from '../services/propertyService';
import { uploadImages } from '../services/uploadService';
import { compressImage } from '../utils/imageCompress';
import { apiErrorMessage } from '../lib/api';
import { formatPricePKR } from '../utils/formatPrice';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';

const DRAFT_KEY = 'estada:listing-draft';
const STEP_KEYS = ['post.stBasics', 'post.stDetails', 'post.stLocation', 'post.stPhotos', 'post.stReview'];

type Form = {
  title: string;
  description: string;
  propertyType: string;
  listingType: string;
  price: string;
  areaValue: string;
  areaUnit: string;
  bedrooms: string;
  bathrooms: string;
  address: string;
  city: string;
  areaName: string;
  lat: number;
  lng: number;
  images: string[];
  videoUrl: string;
};

const EMPTY: Form = {
  title: '', description: '', propertyType: 'house', listingType: 'sale',
  price: '', areaValue: '', areaUnit: 'marla', bedrooms: '', bathrooms: '',
  address: '', city: '', areaName: '', lat: 0, lng: 0, images: [], videoUrl: '',
};

const field = 'w-full rounded-lg border border-hairline bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

export default function PostListingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editId = params.get('edit');
  const user = useAuthStore((s) => s.user);
  const loadSession = useAuthStore((s) => s.loadSession);
  const openAuth = useUiStore((s) => s.openAuth);

  const [form, setForm] = useState<Form>(EMPTY);
  const [step, setStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'locating' | 'pinned'>('idle');

  // Load: existing listing (edit) or the locally-saved draft (create).
  useEffect(() => {
    if (editId) {
      getProperty(editId)
        .then((p) =>
          setForm({
            title: p.title, description: p.description, propertyType: p.propertyType,
            listingType: p.listingType, price: String(p.price), areaValue: String(p.areaValue),
            areaUnit: p.areaUnit, bedrooms: p.bedrooms?.toString() || '', bathrooms: p.bathrooms?.toString() || '',
            address: p.address || '', city: p.city, areaName: p.areaName, lat: p.lat, lng: p.lng,
            images: p.images.map((i) => i.imageUrl), videoUrl: p.videoUrl || '',
          }),
        )
        .catch(() => setError('Could not load this listing.'));
    } else {
      try {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) setForm(JSON.parse(saved));
      } catch {
        /* ignore */
      }
    }
  }, [editId]);

  // Autosave the working draft (create mode only).
  useEffect(() => {
    if (editId) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    } catch {
      /* ignore */
    }
  }, [form, editId]);

  const set = (k: keyof Form, v: string | number | string[]) => setForm((f) => ({ ...f, [k]: v }));

  const onLocation = (loc: PickedLocation) => {
    setGeoStatus('pinned');
    setForm((f) => ({
      ...f,
      lat: loc.lat,
      lng: loc.lng,
      address: loc.address && !f.address ? loc.address.slice(0, 200) : f.address,
      city: loc.city && !f.city ? loc.city : f.city,
    }));
  };

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const compressed = await Promise.all(Array.from(files).map((f) => compressImage(f)));
      const urls = await uploadImages(compressed);
      setForm((f) => ({ ...f, images: [...f.images, ...urls].slice(0, 15) }));
    } catch (err) {
      setError(apiErrorMessage(err, 'Image upload failed. Please try smaller images.'));
    } finally {
      setUploading(false);
    }
  };

  const buildPayload = (isDraft: boolean): ListingPayload => ({
    title: form.title,
    description: form.description,
    propertyType: form.propertyType,
    listingType: form.listingType,
    price: Number(form.price),
    areaValue: Number(form.areaValue),
    areaUnit: form.areaUnit,
    bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
    bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
    address: form.address,
    lat: form.lat,
    lng: form.lng,
    city: form.city,
    areaName: form.areaName,
    images: form.images,
    videoUrl: form.videoUrl || undefined,
    isDraft,
  });

  const submit = async (isDraft: boolean) => {
    setSaving(true);
    setError(null);
    try {
      if (editId) {
        await updateListing(editId, buildPayload(isDraft));
        navigate('/dashboard');
      } else {
        await createListing(buildPayload(isDraft));
        localStorage.removeItem(DRAFT_KEY);
        await loadSession(); // a buyer becomes an owner — refresh their role
        navigate('/dashboard');
      }
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // What (if anything) is still missing on the current step — shown when the
  // user taps Next, so they know exactly what to fill.
  const stepProblem = (): string | null => {
    if (step === 0 && !(form.title.trim().length >= 5 && form.description.trim().length >= 20)) return t('post.reqBasics');
    if (step === 1 && !(Number(form.price) > 0 && Number(form.areaValue) > 0)) return t('post.reqDetails');
    if (step === 2 && !(form.city.trim().length >= 2 && form.areaName.trim().length >= 2)) return t('post.reqLocation');
    return null;
  };

  const goNext = () => {
    const problem = stepProblem();
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setStep((s) => s + 1);
  };

  // Auto-mark the location on the map from the typed city + area/locality, so
  // the dealer doesn't have to know they can click the map.
  useEffect(() => {
    if (step !== 2 || form.lat !== 0) return;
    const city = form.city.trim();
    const area = form.areaName.trim();
    if (city.length < 2 || area.length < 2) return;

    let active = true;
    setGeoStatus('locating');
    const id = setTimeout(async () => {
      const tryGeocode = async (q: string) => {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=pk&limit=1&q=${encodeURIComponent(q)}`,
        );
        const data = await res.json();
        return data[0] ? { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) } : null;
      };
      try {
        const hit = (await tryGeocode(`${area}, ${city}, Pakistan`)) || (await tryGeocode(`${city}, Pakistan`));
        if (!active) return;
        if (hit) {
          setForm((f) => (f.lat === 0 ? { ...f, lat: hit.lat, lng: hit.lng } : f));
          setGeoStatus('pinned');
        } else {
          setGeoStatus('idle');
        }
      } catch {
        if (active) setGeoStatus('idle');
      }
    }, 800);

    return () => {
      active = false;
      clearTimeout(id);
    };
  }, [step, form.city, form.areaName, form.lat]);

  // Access control.
  if (!user) {
    return (
      <Gate>
        <p className="text-ink">{t('post.gateLogin')}</p>
        <button onClick={() => openAuth('login')} className="mt-4 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white">
          {t('nav.login')}
        </button>
      </Gate>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="font-heading text-2xl font-semibold text-ink">
          {editId ? t('post.edit') : t('post.title')}
        </h1>

        {/* Stepper */}
        <div className="mt-4 flex items-center gap-2">
          {STEP_KEYS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                  i < step ? 'bg-verify text-white' : i === step ? 'bg-primary text-white' : 'bg-hairline text-ink-muted'
                }`}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className={`hidden text-xs sm:block ${i === step ? 'text-ink' : 'text-ink-muted'}`}>{t(s)}</span>
              {i < STEP_KEYS.length - 1 && <div className="h-px flex-1 bg-hairline" />}
            </div>
          ))}
        </div>

        {error && <div className="mt-4 rounded-lg bg-cta/5 px-3 py-2 text-sm text-cta">{error}</div>}

        <div className="mt-6 rounded-card border border-hairline bg-surface p-5">
          {step === 0 && (
            <div className="space-y-4">
              <Input label={t('post.fTitle')} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder={t('post.phTitle')} />
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">{t('post.fDescription')}</label>
                <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={5} className={field} placeholder={t('post.phDescription')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-ink">{t('post.fType')}</label>
                  <select value={form.propertyType} onChange={(e) => set('propertyType', e.target.value)} className={field}>
                    <option value="house">{t('spec.house')}</option><option value="flat">{t('spec.flat')}</option><option value="plot">{t('spec.plot')}</option>
                    <option value="commercial">{t('spec.commercial')}</option><option value="agricultural">{t('nav.agricultural')}</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-ink">{t('post.fPurpose')}</label>
                  <select value={form.listingType} onChange={(e) => set('listingType', e.target.value)} className={field}>
                    <option value="sale">{t('card.forSale')}</option><option value="rent">{t('card.forRent')}</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <Input label={`${t('post.fPrice')}${form.listingType === 'rent' ? t('post.perMonthSuffix') : ''}`} type="number" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="e.g. 32000000" />
              {form.price && Number(form.price) > 0 && (
                <p className="-mt-2 text-sm text-verify">≈ {formatPricePKR(form.price)}</p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Input label={t('post.fArea')} type="number" value={form.areaValue} onChange={(e) => set('areaValue', e.target.value)} placeholder="e.g. 10" />
                <div>
                  <label className="mb-1 block text-sm font-medium text-ink">{t('post.fUnit')}</label>
                  <select value={form.areaUnit} onChange={(e) => set('areaUnit', e.target.value)} className={field}>
                    <option value="marla">{t('post.unitMarla')}</option><option value="sqft">{t('post.unitSqft')}</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label={t('post.fBedrooms')} type="number" value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} />
                <Input label={t('post.fBathrooms')} type="number" value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="rounded-lg bg-canvas px-3 py-2 text-sm text-ink-muted">{t('post.locAutoHint')}</p>
              <div className="grid grid-cols-2 gap-3">
                <Input label={t('post.fCity')} value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Lahore" />
                <Input label={t('post.fLocality')} value={form.areaName} onChange={(e) => set('areaName', e.target.value)} placeholder="DHA Phase 5" />
              </div>
              {geoStatus === 'locating' && <p className="text-sm text-ink-muted">{t('post.locating')}</p>}
              {geoStatus === 'pinned' && form.lat !== 0 && <p className="text-sm text-verify">{t('post.locPinned')}</p>}
              <LocationPicker lat={form.lat} lng={form.lng} onChange={onLocation} />
              <Input label={t('post.fAddress')} value={form.address} onChange={(e) => set('address', e.target.value)} placeholder={t('post.phAddress')} />
            </div>
          )}

          {step === 3 && (
            <div>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-hairline bg-canvas py-10 text-center hover:border-primary">
                {uploading ? <Loader2 className="animate-spin text-primary" /> : <Upload className="text-ink-muted" />}
                <span className="text-sm text-ink-muted">{uploading ? t('post.uploading') : t('post.uploadCta')}</span>
                <input type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
              </label>
              {form.images.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {form.images.map((url, i) => (
                    <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-hairline">
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      {i === 0 && <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] text-white">{t('post.cover')}</span>}
                      <button onClick={() => set('images', form.images.filter((u) => u !== url))} className="absolute right-1 top-1 hidden rounded-full bg-black/60 p-1 text-white group-hover:block" aria-label="Remove">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-2 text-xs text-ink-muted">{t('post.photoHint')}</p>

              <div className="mt-4">
                <Input
                  label={t('post.fVideo')}
                  value={form.videoUrl}
                  onChange={(e) => set('videoUrl', e.target.value)}
                  placeholder={t('post.phVideo')}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-2 text-sm">
              <Row k={t('post.rTitle')} v={form.title} />
              <Row k={t('post.rType')} v={`${t('spec.' + form.propertyType)} · ${form.listingType === 'rent' ? t('card.forRent') : t('card.forSale')}`} />
              <Row k={t('post.rPrice')} v={`PKR ${formatPricePKR(form.price || 0)}`} />
              <Row k={t('post.rArea')} v={`${form.areaValue} ${form.areaUnit === 'marla' ? t('post.unitMarla') : t('post.unitSqft')}`} />
              <Row k={t('post.rLocation')} v={`${form.areaName}, ${form.city}`} />
              <Row k={t('post.rPhotos')} v={t('post.photosUploaded', { n: form.images.length })} />
              <p className="pt-2 text-ink-muted">{t('post.reviewNote')}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-5 flex items-center justify-between">
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="rounded-lg border border-hairline px-4 py-2 text-sm font-medium text-ink disabled:opacity-40">
            {t('post.back')}
          </button>
          {step < STEP_KEYS.length - 1 ? (
            <button onClick={goNext} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-light">
              {t('post.next')}
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => submit(true)} disabled={saving} className="rounded-lg border border-hairline px-4 py-2 text-sm font-medium text-ink hover:bg-canvas disabled:opacity-50">
                {t('post.saveDraft')}
              </button>
              <button onClick={() => submit(false)} disabled={saving} className="rounded-lg bg-cta px-5 py-2 text-sm font-medium text-white hover:bg-cta-hover disabled:opacity-50">
                {saving ? t('post.saving') : t('post.publish')}
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-hairline py-1.5">
      <span className="text-ink-muted">{k}</span>
      <span className="text-right font-medium text-ink">{v}</span>
    </div>
  );
}

function Gate({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Navbar />
      <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        {children}
      </main>
      <Footer />
    </div>
  );
}
