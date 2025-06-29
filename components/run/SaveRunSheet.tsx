/* eslint-disable @next/next/no-async-client-component, @next/next/no-assign-function-props */
import { Sheet, SheetContent } from '@/components/ui/sheet';
import Button from '@/components/ui/Button';
import { useRunSession } from './RunSessionProvider';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import RunStats from './RunStats';
import RunMapPreview from './RunMapPreview';
import { calculateDistance } from '@/utils/helpers';

interface SaveRunSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: () => void;
  onDelete: () => void;
}

export default function SaveRunSheet({
  open,
  onOpenChange,
  onSave,
  onDelete,
}: SaveRunSheetProps) {
  const { state } = useRunSession();
  const t = useTranslations('run');

  /* -------- beregn distanse én gang per rute-endring -------- */
  const distanceMeters = useMemo(() => {
    return state.route.reduce((acc, p, i, arr) => {
      if (i === 0) return acc;
      const prev = arr[i - 1];
      return acc + calculateDistance(prev.lat, prev.lng, p.lat, p.lng);
    }, 0);
  }, [state.route]);

  const runName = useMemo(
    () => generateRunName(state.startTime),
    [state.startTime]
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* side="bottom" → glir opp som klassisk bottom-sheet */}
      <SheetContent
        side="bottom"
        className="w-full pt-4 pb-6 rounded-t-2xl max-h-[90vh] overflow-y-auto scroll-smooth"
      >
        <h2 className="text-lg font-semibold mb-3">{runName}</h2>

        {/* kartet får fast høyde så resten av innholdet blir synlig uten mye scrolling */}
        <div className="h-[40vh] mb-4">
          <RunMapPreview points={state.route.map((p) => [p.lat, p.lng])} />
        </div>

        <RunStats distance={distanceMeters} duration={state.activeDuration} />

        <div className="grid grid-cols-2 gap-4 mt-4">
          <Button variant="danger" onClick={onDelete}>
            {t('delete')}
          </Button>
          <Button onClick={onSave}>{t('save')}</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* --------------------- helpers --------------------- */
function generateRunName(timestamp: number | null) {
  if (!timestamp) return 'Økt uten navn';
  const d = new Date(timestamp);
  const hour = d.getHours();
  const daypart =
    hour < 10
      ? 'Morgenøkt'
      : hour < 14
      ? 'Formiddagsøkt'
      : hour < 18
      ? 'Ettermiddagsøkt'
      : 'Kveldsøkt';
  return `${daypart} · ${d.toLocaleDateString('no-NO')}`;
}