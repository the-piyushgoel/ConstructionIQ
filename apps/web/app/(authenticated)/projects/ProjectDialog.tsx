"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import type { Project, ProjectStatus } from "@construction-iq/shared";
import { apiClient } from "@/lib/api/client";
import { useNotificationStore } from "@/store/useNotificationStore";

import { Button } from "@/components/primitives/Button";
import { Input } from "@/components/primitives/Input";
import { Textarea } from "@/components/primitives/Textarea";
import { Select } from "@/components/primitives/Select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/primitives/Dialog";

const projectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  status: z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"]).optional(),
  budget: z.union([z.string(), z.number()]),
  actualCost: z.union([z.string(), z.number()]).optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onSuccess: () => void;
}

export function ProjectDialog({
  open,
  onOpenChange,
  project,
  onSuccess,
}: ProjectDialogProps) {
  const isEditing = !!project;
  const [loading, setLoading] = React.useState(false);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name || "",
      description: project?.description || "",
      status: (project?.status as ProjectStatus) || "PLANNING",
      budget: project?.budget ? Number(project.budget) : 0,
      actualCost: project?.actualCost ? Number(project.actualCost) : 0,
      startDate: project?.startDate
        ? format(new Date(project.startDate), "yyyy-MM-dd")
        : "",
      endDate: project?.endDate
        ? format(new Date(project.endDate), "yyyy-MM-dd")
        : "",
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    try {
      setLoading(true);
      // Ensure dates are parsed as ISO strings
      const payload = {
        ...data,
        budget: Number(data.budget),
        actualCost: data.actualCost ? Number(data.actualCost) : 0,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      };

      if (isEditing) {
        await apiClient.patch(`/projects/${project.id}`, payload);
        useNotificationStore.getState().addNotification({
          title: "Success",
          message: "Project updated successfully",
        });
      } else {
        await apiClient.post("/projects", payload);
        useNotificationStore.getState().addNotification({
          title: "Success",
          message: "Project created successfully",
        });
      }
      onSuccess();
    } catch (err: unknown) {
      // Error handled by interceptor or log locally
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Project" : "Create Project"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of your project below."
              : "Fill in the details to create a new project."}
          </DialogDescription>
        </DialogHeader>

        <form id="project-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-body-sm font-medium text-text-primary">
              Project Name
            </label>
            <Input {...form.register("name")} placeholder="e.g., Downtown Tower" />
            {form.formState.errors.name && (
              <p className="text-body-sm text-risk-critical-text">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-body-sm font-medium text-text-primary">
              Description
            </label>
            <Textarea
              {...form.register("description")}
              placeholder="Brief description of the project"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-body-sm font-medium text-text-primary">
                Start Date
              </label>
              <Input type="date" {...form.register("startDate")} />
              {form.formState.errors.startDate && (
                <p className="text-body-sm text-risk-critical-text">
                  {form.formState.errors.startDate.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-body-sm font-medium text-text-primary">
                End Date
              </label>
              <Input type="date" {...form.register("endDate")} />
              {form.formState.errors.endDate && (
                <p className="text-body-sm text-risk-critical-text">
                  {form.formState.errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-body-sm font-medium text-text-primary">
                Budget ($)
              </label>
              <Input type="number" step="1000" {...form.register("budget")} />
              {form.formState.errors.budget && (
                <p className="text-body-sm text-risk-critical-text">
                  {form.formState.errors.budget.message}
                </p>
              )}
            </div>
            {isEditing && (
              <div className="space-y-2">
                <label className="text-body-sm font-medium text-text-primary">
                  Actual Cost ($)
                </label>
                <Input type="number" step="1000" {...form.register("actualCost")} />
              </div>
            )}
          </div>

          {isEditing && (
            <div className="space-y-2">
              <label className="text-body-sm font-medium text-text-primary">
                Status
              </label>
              <Select {...form.register("status")}>
                <option value="PLANNING">Planning</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </Select>
            </div>
          )}
        </form>

        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" form="project-form" loading={loading}>
            {isEditing ? "Save Changes" : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
