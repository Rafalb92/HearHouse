type Props = {
  specs: Record<string, unknown>;
};

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    const items = value.filter((v) => v !== null && v !== undefined);
    return items.length ? items.join(', ') : null;
  }
  return null;
}

// ─── Spec row ─────────────────────────────────────────────────────────────────

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='grid grid-cols-2 gap-4 py-3 border-b last:border-0'>
      <span className='text-sm text-muted-foreground'>{label}</span>
      <span className='text-sm font-medium'>{value}</span>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function SpecSection({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: string }[];
}) {
  if (!rows.length) return null;
  return (
    <div className='rounded-xl border p-6'>
      <h3 className='text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3'>
        {title}
      </h3>
      {rows.map((r) => (
        <SpecRow key={r.label} label={r.label} value={r.value} />
      ))}
    </div>
  );
}

// ─── Parsers per section ──────────────────────────────────────────────────────

function parseGeneral(specs: Record<string, unknown>) {
  const rows: { label: string; value: string }[] = [];

  const formFactor = formatValue(specs.formFactor);
  if (formFactor) rows.push({ label: 'Form factor', value: formFactor });

  const weight = formatValue(specs.weightGrams);
  if (weight) rows.push({ label: 'Weight', value: `${weight} g` });

  const water = specs.waterResistance as Record<string, unknown> | null;
  const waterRating = water ? formatValue(water.rating) : null;
  if (waterRating) rows.push({ label: 'Water resistance', value: waterRating });

  const warranty = formatValue(specs.warrantyMonths);
  if (warranty) rows.push({ label: 'Warranty', value: `${warranty} months` });

  const release = formatValue(specs.releaseYear);
  if (release) rows.push({ label: 'Release year', value: release });

  const inBox = formatValue(specs.includedInBox);
  if (inBox) rows.push({ label: 'In the box', value: inBox });

  return rows;
}

function parseDriver(specs: Record<string, unknown>) {
  const rows: { label: string; value: string }[] = [];
  const driver = specs.driver as Record<string, unknown> | null;
  if (!driver) return rows;

  const type = formatValue(driver.type);
  const size = formatValue(driver.sizeMm);
  if (type || size) {
    const val = [type, size ? `${size} mm` : null].filter(Boolean).join(', ');
    rows.push({ label: 'Driver', value: val });
  }
  return rows;
}

function parseConnectivity(specs: Record<string, unknown>) {
  const rows: { label: string; value: string }[] = [];
  const conn = specs.connectivity as Record<string, unknown> | null;
  if (!conn) return rows;

  // Wireless
  const wireless = conn.wireless as Record<string, unknown> | null;
  if (wireless) {
    const bt = formatValue(wireless.bluetoothVersion);
    if (bt) rows.push({ label: 'Bluetooth', value: bt });

    const codecs = formatValue(wireless.codecs);
    if (codecs) rows.push({ label: 'Codecs', value: codecs });

    const multipoint = formatValue(wireless.multipoint);
    if (multipoint) rows.push({ label: 'Multipoint', value: multipoint });
  }

  // Wired
  const wired = conn.wired as Record<string, unknown> | null;
  if (wired) {
    const jack = formatValue(wired.jack);
    const connector = formatValue(wired.connector);
    if (jack || connector) {
      rows.push({ label: 'Wired', value: connector ?? jack ?? '' });
    }
    const detachable = wired.detachableCable;
    if (detachable === true)
      rows.push({ label: 'Detachable cable', value: 'Yes' });
  }

  return rows;
}

function parseANC(specs: Record<string, unknown>) {
  const rows: { label: string; value: string }[] = [];
  const anc = specs.noiseCancellation as Record<string, unknown> | null;
  if (!anc) return rows;

  const active = formatValue(anc.active);
  if (active) rows.push({ label: 'Active noise cancellation', value: active });

  const transparency = formatValue(anc.transparencyMode);
  if (transparency)
    rows.push({ label: 'Transparency mode', value: transparency });

  const wind = formatValue(anc.windReduction);
  if (wind) rows.push({ label: 'Wind reduction', value: wind });

  return rows;
}

function parseBattery(specs: Record<string, unknown>) {
  const rows: { label: string; value: string }[] = [];
  const bat = specs.battery as Record<string, unknown> | null;
  if (!bat) return rows;

  const hours = formatValue(bat.upToHours);
  const hoursAnc = formatValue(bat.upToHoursWithAnc);
  const caseHours = formatValue(bat.caseTotalHours);

  if (hours) {
    const label = hoursAnc ? `${hours}h (${hoursAnc}h with ANC)` : `${hours}h`;
    rows.push({ label: 'Battery life', value: label });
  }
  if (caseHours)
    rows.push({ label: 'Total with case', value: `${caseHours}h` });

  const charging = bat.charging as Record<string, unknown> | null;
  if (charging) {
    const usb = formatValue(charging.usb);
    if (usb) rows.push({ label: 'Charging', value: usb });

    const fast = formatValue(charging.fastCharge);
    if (fast) rows.push({ label: 'Fast charge', value: fast });

    const wireless = formatValue(charging.wireless);
    if (wireless === 'true' || wireless === 'Yes') {
      rows.push({ label: 'Wireless charging', value: 'Yes' });
    }
  }
  return rows;
}

function parseMicrophones(specs: Record<string, unknown>) {
  const rows: { label: string; value: string }[] = [];
  const mic = specs.microphones as Record<string, unknown> | null;
  if (!mic) return rows;

  const count = formatValue(mic.count);
  if (count && count !== '0') rows.push({ label: 'Microphones', value: count });

  const noise = formatValue(mic.noiseReductionForCalls);
  if (noise && noise === 'true') {
    rows.push({ label: 'Noise reduction for calls', value: 'Yes' });
  }
  return rows;
}

function parseControls(specs: Record<string, unknown>) {
  const rows: { label: string; value: string }[] = [];
  const ctrl = specs.controls as Record<string, unknown> | null;
  if (!ctrl) return rows;

  const type = formatValue(ctrl.type);
  if (type && type !== 'none') rows.push({ label: 'Controls', value: type });

  const va = formatValue(ctrl.voiceAssistant);
  if (va === 'true') rows.push({ label: 'Voice assistant', value: 'Yes' });

  return rows;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SpecsTable({ specs }: Props) {
  const general = parseGeneral(specs);
  const driver = parseDriver(specs);
  const connectivity = parseConnectivity(specs);
  const anc = parseANC(specs);
  const battery = parseBattery(specs);
  const microphones = parseMicrophones(specs);
  const controls = parseControls(specs);

  const allEmpty =
    !general.length &&
    !driver.length &&
    !connectivity.length &&
    !anc.length &&
    !battery.length &&
    !microphones.length &&
    !controls.length;

  if (allEmpty) return null;

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
      <SpecSection title='General' rows={[...general, ...driver]} />
      <SpecSection title='Connectivity' rows={connectivity} />
      {battery.length > 0 && <SpecSection title='Battery' rows={battery} />}
      {anc.length > 0 && <SpecSection title='Sound & Noise' rows={anc} />}
      {(microphones.length > 0 || controls.length > 0) && (
        <SpecSection
          title='Controls & Microphones'
          rows={[...microphones, ...controls]}
        />
      )}
    </div>
  );
}
