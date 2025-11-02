import { AppLayout } from "@/components/app-layout";

export function Todo() {
  return (
    <AppLayout
      breadcrumbs={[
        { label: "Work", href: "#" },
        { label: "Todo" },
      ]}
    >
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

