/**
 * Property specification table. Always shows ALL fields — empty ones read
 * "Not specified" rather than being hidden (Section 5 requirement).
 */
import type { PropertyDetail } from '../../types/property';
import { formatPricePKRLabeled, formatArea } from '../../utils/formatPrice';

const TYPE_LABEL: Record<string, string> = {
  house: 'House',
  plot: 'Plot',
  flat: 'Flat',
  commercial: 'Commercial',
  agricultural: 'Agricultural land',
};

const STATUS_LABEL: Record<string, string> = {
  active: 'Available',
  under_offer: 'Under offer',
  sold: 'Sold',
  expired: 'Expired',
};

const NA = <span className="text-ink-muted">Not specified</span>;

export default function SpecTable({ property }: { property: PropertyDetail }) {
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: 'Type', value: TYPE_LABEL[property.propertyType] },
    { label: 'Purpose', value: property.listingType === 'rent' ? 'For Rent' : 'For Sale' },
    {
      label: 'Price',
      value: `${formatPricePKRLabeled(property.price)}${property.listingType === 'rent' ? ' / month' : ''}`,
    },
    { label: 'Area', value: formatArea(property.areaValue, property.areaUnit) },
    { label: 'Bedrooms', value: property.bedrooms != null ? property.bedrooms : NA },
    { label: 'Bathrooms', value: property.bathrooms != null ? property.bathrooms : NA },
    { label: 'City', value: property.city || NA },
    { label: 'Locality', value: property.areaName || NA },
    { label: 'Status', value: STATUS_LABEL[property.status] },
    {
      label: 'Documents',
      value: property.isDocumentVerified ? (
        <span className="font-medium text-verify">Verified</span>
      ) : (
        'Not verified'
      ),
    },
    { label: 'Listed on', value: new Date(property.createdAt).toLocaleDateString('en-PK') },
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
