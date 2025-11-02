import { AppLayout } from "@/components/app-layout";

export function Calendar() {
  return (
    <AppLayout
      breadcrumbs={[
        { label: "Work", href: "#" },
        { label: "Calendar" },
      ]}
    >
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Calendar</h1>
          <p className="text-muted-foreground">
            View and manage your schedule.
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg p-6 min-h-[400px]">
          <p className="text-sm text-muted-foreground text-center">
            Calendar view will appear here
          </p>
        </div>
      </div>
    </AppLayout>
  );
}

