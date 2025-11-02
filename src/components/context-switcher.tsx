"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, GalleryVerticalEnd } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useSelectedContext } from "./context-provider";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ContextSwitcher() {
  const { isMobile } = useSidebar();
  const { selectedContextId, setSelectedContextId } = useSelectedContext();
  const contexts = useQuery(api.contexts.list);
  const createContext = useMutation(api.contexts.create);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [newContextName, setNewContextName] = React.useState("");

  // Get active context - prefer selected, then first context, or null
  const activeContext = React.useMemo(() => {
    if (!contexts) return null;
    if (selectedContextId) {
      const found = contexts.find((c) => c._id === selectedContextId);
      if (found) return found;
    }
    return contexts[0] || null;
  }, [contexts, selectedContextId]);

  // Initialize selected context on first load
  React.useEffect(() => {
    if (contexts && contexts.length > 0 && !selectedContextId) {
      const firstContextId = contexts[0]._id;
      setSelectedContextId(firstContextId);
    }
  }, [contexts, selectedContextId, setSelectedContextId]);

  const handleContextSelect = (contextId: Id<"contexts">) => {
    setSelectedContextId(contextId);
  };

  const handleCreateContext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContextName.trim()) return;
    try {
      const contextId = await createContext({ name: newContextName.trim() });
      setNewContextName("");
      setIsCreateDialogOpen(false);
      setSelectedContextId(contextId);
    } catch (error) {
      console.error("Error creating context:", error);
    }
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
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
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
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateContext}>
                <DialogHeader>
                  <DialogTitle>Create New Context</DialogTitle>
                  <DialogDescription>
                    Create a context to organize your tasks (e.g., Work,
                    Personal, Study).
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Context Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Work, Personal, Study"
                      value={newContextName}
                      onChange={(e) => setNewContextName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
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
              return (
                <DropdownMenuItem
                  key={context._id}
                  onClick={() => handleContextSelect(context._id)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <ContextIcon className="size-3.5 shrink-0" />
                  </div>
                  {context.name}
                  {context._id === activeContext._id && (
                    <DropdownMenuShortcut>✓</DropdownMenuShortcut>
                  )}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <DropdownMenuItem
                  className="gap-2 p-2"
                  onSelect={(e) => e.preventDefault()}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                    <Plus className="size-4" />
                  </div>
                  <div className="text-muted-foreground font-medium">
                    Add context
                  </div>
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleCreateContext}>
                  <DialogHeader>
                    <DialogTitle>Create New Context</DialogTitle>
                    <DialogDescription>
                      Create a context to organize your tasks (e.g., Work,
                      Personal, Study).
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Context Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Work, Personal, Study"
                        value={newContextName}
                        onChange={(e) => setNewContextName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Create</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
