import { AppLayout } from "@/components/app-layout";
import { useSelectedContext } from "@/components/context-provider";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function Calendar() {
  const { selectedContextId } = useSelectedContext();
  const contexts = useQuery(api.contexts.list);
  const selectedContext = contexts?.find((c) => c._id === selectedContextId);

  const breadcrumbs = selectedContext
    ? [{ label: selectedContext.name, href: "#" }, { label: "Calendar" }]
    : [{ label: "Work", href: "#" }, { label: "Calendar" }];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
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
