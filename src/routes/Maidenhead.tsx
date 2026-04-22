import AppShell from '../components/AppShell'
import { Button, Card } from '../components/ui'

export default function Maidenhead() {
  return (
    <AppShell
      title="Maidenhead Grid Map"
      eyebrow="Reference Console"
      description="Use the embedded locator map for quick world-grid reference without interrupting the rest of the station workflow."
      actions={
        <a href="https://www.mapability.com/ei8ic/maps/gridworld2.php" target="_blank" rel="noopener noreferrer">
          <Button type="button" variant="secondary">Open External Map</Button>
        </a>
      }
    >
      <div className="grid gap-6">
        <Card>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="label-caps mb-2">World Map Locator</div>
              <h2 className="text-2xl font-semibold text-white">
                Maidenhead Reference
                <span className="ml-3 text-lg font-medium text-amber-200">Thanks to radio operator EI8IC</span>
              </h2>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-700/50">
            <iframe
              src="https://www.mapability.com/ei8ic/maps/gridworld2.php"
              className="h-[72vh] w-full border-0"
              title="Maidenhead Grid Map"
            />
          </div>
        </Card>

        <Card>
          <div className="label-caps mb-2">Fallback Access</div>
          <p className="text-sm text-slate-300">
            If the embedded map does not load in your browser, use the external link above to open the same Maidenhead reference directly.
          </p>
        </Card>
      </div>
    </AppShell>
  )
}
