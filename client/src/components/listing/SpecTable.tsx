/**
 * Property specification table. Always shows ALL fields — empty ones read
 * "Not specified" rather than being hidden (Section 5 requirement).
 */
import { useTranslation } from 'react-i18next';
import type { PropertyDetail } from '../../types/property';
import { formatPricePKRLabeled, formatArea } from '../../utils/formatPrice';

export default function SpecTable({ property }: { property: PropertyDetail }) {
  const { t } = useTranslation();
  const typeLabels: Record<string, string> = {
    house: t('spec.house'),
    plot: t('spec.plot'),
    flat: t('spec.flat'),
    commercial: t('spec.commercial'),
    agricultural: t('spec.agricultural'),
  };
  const statusLabels: Record<string, string> = {
    active: t('spec.stAvailable'),
    under_offer: t('spec.stUnderOffer'),
    sold: t('spec.stSold'),
    expired: t('spec.stExpired'),
  };
  const NA = <span className="text-ink-muted">{t('spec.notSpecified')}</span>;

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: t('spec.type'), value: typeLabels[property.propertyType] },
    { label: t('spec.purpose'), value: property.listingType === 'rent' ? t('spec.forRent') : t('spec.forSale') },
    {
      label: t('spec.price'),
      value: `${formatPricePKRLabeled(property.price)}${property.listingType === 'rent' ? t('spec.perMonthSuffix') : ''}`,
    },
    { label: t('spec.area'), value: formatArea(property.areaValue, property.areaUnit) },
    { label: t('spec.bedrooms'), value: property.bedrooms != null ? property.bedrooms : NA },
    { label: t('spec.bathrooms'), value: property.bathrooms != null ? property.bathrooms : NA },
    { label: t('spec.city'), value: property.city || NA },
    { label: t('spec.locality'), value: property.areaName || NA },
    { label: t('spec.status'), value: statusLabels[property.status] },
    {
      label: t('spec.documents'),
      value: property.isDocumentVerified ? (
        <span className="font-medium text-verify">{t('spec.verified')}</span>
      ) : (
        t('spec.notVerified')
      ),
    },
    { label: t('spec.listedOn'), value: new Date(property.createdAt).toLocaleDateString('en-PK') },
  ];

  return (
    <div className="overflow-hidden rounded-card border border-hairline">
      <dl className="divide-y divide-hairline">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between gap-4 px-4 py-2.5 text-sm odd:bg-canvas/50">
            <dt className="text-ink-muted">{r.label}</dt>
            <dd className="text-right font-medium text-ink">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
