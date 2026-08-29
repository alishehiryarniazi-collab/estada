/**
 * Area unit converter — enter a value in any Pakistani unit and see it in all
 * the others (marla, kanal, sq ft, sq yd, sq m, acre).
 */
import { useMemo, useState } from 'react';
import Input from '../ui/Input';
import { convertArea, UNIT_LABELS, tidy } from '../../utils/units';

export default function AreaConverter() {
  const [value, setValue] = useState('1');
  const [unit, setUnit] = useState('marla');

  const results = useMemo(() => convertArea(Number(value) || 0, unit), [value, unit]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-3">
        <Input label="Value" type="number" value={value} onChange={(e) => setValue(e.target.value)} />
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Unit</label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full rounded-lg border border-hairline bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {Object.entries(UNIT_LABELS).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-card border border-hairline bg-canvas p-5">
        <p className="mb-2 text-sm text-ink-muted">
          {value || 0} {UNIT_LABELS[unit]} equals
        </p>
        <dl className="space-y-2 text-sm">
          {Object.entries(results)
            .filter(([k]) => k !== unit)
            .map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-hairline pb-2">
                <dt className="text-ink-muted">{UNIT_LABELS[k]}</dt>
                <dd className="font-medium text-ink">{tidy(v)}</dd>
              </div>
            ))}
        </dl>
      </div>
    </div>
  );
}
