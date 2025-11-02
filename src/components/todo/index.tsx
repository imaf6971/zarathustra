import { AppLayout } from "@/components/app-layout";
import { useSelectedContext } from "@/components/context-provider";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function Todo() {
  const { selectedContextId } = useSelectedContext();
  const contexts = useQuery(api.contexts.list);
  const selectedContext = contexts?.find((c) => c._id === selectedContextId);

  const breadcrumbs = selectedContext
    ? [{ label: selectedContext.name, href: "#" }, { label: "Todo" }]
    : [{ label: "Work", href: "#" }, { label: "Todo" }];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Todo</h1>
          <p className="text-muted-foreground">
            Manage your tasks and stay organized.
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg p-6 min-h-[400px]">
          <p className="text-sm text-muted-foreground text-center">
            Your tasks will appear here
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
