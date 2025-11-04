"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ChevronsUpDown,
  Plus,
  GalleryVerticalEnd,
  Pencil,
  Trash2,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { useSelectedContext } from "./context-provider";
import { CreateContextDialog } from "./contexts/create-context-dialog";
import { EditContextDialog } from "./contexts/edit-context-dialog";
import { DeleteContextDialog } from "./contexts/delete-context-dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function ContextSwitcher() {
  const { isMobile } = useSidebar();
  const { selectedContextId, setSelectedContextId } = useSelectedContext();
  const contexts = useQuery(api.contexts.list);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [actionContext, setActionContext] = useState<{
    type: "edit" | "delete";
    context: Pick<Doc<"contexts">, "_id" | "name">;
  } | null>(null);

  // Derive boolean states from context objects
  const isEditDialogOpen = actionContext?.type === "edit";
  const isDeleteDialogOpen = actionContext?.type === "delete";

  // Get active context - prefer selected, then first context, or null
  const activeContext = useMemo(() => {
    if (!contexts) return null;
    if (selectedContextId) {
      const found = contexts.find((c) => c._id === selectedContextId);
      if (found) return found;
    }
    return contexts[0] || null;
  }, [contexts, selectedContextId]);

  // Initialize selected context on first load
  useEffect(() => {
    if (contexts && contexts.length > 0 && !selectedContextId) {
      const firstContextId = contexts[0]._id;
      setSelectedContextId(firstContextId);
    }
  }, [contexts, selectedContextId, setSelectedContextId]);

  const handleContextSelect = (contextId: Id<"contexts">) => {
    setSelectedContextId(contextId);
  };

  const handleCreateSuccess = (contextId: Id<"contexts">) => {
    setSelectedContextId(contextId);
  };

  const handleEditContext = (
    context: Pick<Doc<"contexts">, "_id" | "name">
  ) => {
    setActionContext({ type: "edit", context });
  };

  const handleDeleteContext = (
    context: Pick<Doc<"contexts">, "_id" | "name">
  ) => {
    setActionContext({ type: "delete", context });
  };

  const handleDeleteSuccess = () => {
    // If we deleted the selected context, switch to the first available context
    if (
      contexts &&
      actionContext?.type === "delete" &&
      selectedContextId === actionContext.context._id
    ) {
      const remainingContexts = contexts.filter(
        (c) => c._id !== actionContext.context._id
      );
      if (remainingContexts.length > 0) {
        setSelectedContextId(remainingContexts[0]._id);
      } else {
        setSelectedContextId(null);
      }
    }
    setActionContext(null);
  };

  const getContextIcon = (_icon?: string) => {
    // For now, use a default icon. Later can map icon strings to actual icons
    return GalleryVerticalEnd;
  };

  if (!contexts) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Loading...</span>
              <span className="truncate text-xs">Context</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!activeContext) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <CreateContextDialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            onSuccess={handleCreateSuccess}
            trigger={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Plus className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Create Context</span>
                  <span className="truncate text-xs">Get Started</span>
                </div>
              </SidebarMenuButton>
            }
          />
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const IconComponent = getContextIcon(activeContext.icon);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <IconComponent className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeContext.name}
                </span>
                <span className="truncate text-xs">Context</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Contexts
            </DropdownMenuLabel>
            {contexts.map((context) => {
              const ContextIcon = getContextIcon(context.icon);
              const isSelected = context._id === activeContext._id;
              return (
                <DropdownMenuSub key={context._id}>
                  <DropdownMenuSubTrigger
                    className={cn("gap-2 p-2", isSelected && "bg-muted")}
                    onClick={() => {
                      // Allow submenu to open, but also select on click
                      handleContextSelect(context._id);
                    }}
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border">
                      <ContextIcon className="size-3.5 shrink-0" />
                    </div>
                    {context.name}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onClick={() => handleEditContext(context)}
                      className="gap-2"
                    >
                      <Pencil className="size-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteContext(context)}
                      variant="destructive"
                      className="gap-2"
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              );
            })}
            <DropdownMenuSeparator />
            <CreateContextDialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
              onSuccess={handleCreateSuccess}
              trigger={
                <DropdownMenuItem
                  className="gap-2 p-2"
                  onSelect={(e) => {
                    e.preventDefault();
                    setIsCreateDialogOpen(true);
                  }}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                    <Plus className="size-4" />
                  </div>
                  <div className="text-muted-foreground font-medium">
                    Add context
                  </div>
                </DropdownMenuItem>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
        <EditContextDialog
          key={
            actionContext?.type === "edit" ? actionContext.context._id : "new"
          }
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setActionContext(null);
            }
          }}
          context={
            actionContext?.type === "edit" ? actionContext.context : null
          }
        />
        <DeleteContextDialog
          open={isDeleteDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setActionContext(null);
            }
          }}
          context={
            actionContext?.type === "delete" ? actionContext.context : null
          }
          onSuccess={handleDeleteSuccess}
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
