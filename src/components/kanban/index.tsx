import { AppLayout } from "@/components/app-layout";

export function Kanban() {
  return (
    <AppLayout
      breadcrumbs={[
        { label: "Work", href: "#" },
        { label: "Kanban" },
      ]}
    >
      <div className="grid grid-cols-3 gap-4 h-full">
        {/* Backlog Column */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Backlog
            </h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              0
            </span>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto">
            {/* Cards will go here */}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-semibold text-muted-foreground">
              In Progress
            </h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              0
            </span>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto">
            {/* Cards will go here */}
          </div>
        </div>

        {/* Done Column */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Done
            </h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              0
            </span>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto">
            {/* Cards will go here */}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

