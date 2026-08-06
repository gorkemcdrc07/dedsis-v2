import type { OperationRow } from "../../features/operations/types";

type FieldProps = {
  label: string;
  value: unknown;
};

function Field({ label, value }: FieldProps) {
  const text =
    value === null || value === undefined || value === ""
      ? "-"
      : String(value);

  return (
    <div>
      <div className="text-xs font-medium text-slate-500">
        {label}
      </div>

      <div className="mt-1 break-words text-sm font-semibold text-slate-900">
        {text}
      </div>
    </div>
  );
}

export function GeneralCard({ row }: { row: OperationRow }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="mb-5 font-bold text-slate-950">
        Genel bilgiler
      </h3>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Sefer no"
          value={row.TMSDespatchesDocumentNo}
        />
        <Field label="Proje" value={row.ProjectName} />
        <Field label="Plaka" value={row.PlateNumber} />
        <Field
          label="Çalışma tipi"
          value={row.VehicleWorkingTypeName}
        />
        <Field
          label="Ana grup"
          value={row.VehicleMasterGroupName}
        />
        <Field
          label="Özel grup"
          value={row.SpecialGroupName}
        />
        <Field
          label="Verilen araç tipi"
          value={row.GivenVehicleTypeName}
        />
        <Field
          label="İstenen araç tipi"
          value={row.DesiredVehicleTypeName}
        />
        <Field label="Toplam tonaj" value={row.TotalTonnage} />
        <Field
          label="Miktar"
          value={`${row.Quantity ?? 0} ${row.UnitName ?? ""}`}
        />
      </div>
    </section>
  );
}
