"use client";

import * as React from "react";
import { Plus, Trash, Edit, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import type { Project, PaginatedResponse } from "@construction-iq/shared";
import { apiClient } from "@/lib/api/client";
import { useNotificationStore } from "@/store/useNotificationStore";

import { Button } from "@/components/primitives/Button";
import { Badge } from "@/components/primitives/Badge";
import { LoadingState } from "@/components/primitives/LoadingState";
import { EmptyState } from "@/components/primitives/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/primitives/Table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/primitives/Dropdown";
import { ProjectDialog } from "./ProjectDialog";
import { DeleteDialog } from "./DeleteDialog";

export default function ProjectsPage() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);

  const fetchProjects = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<PaginatedResponse<Project>>("/projects");
      setProjects(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setDialogOpen(true);
  };

  const handleDeleteClick = (project: Project) => {
    setSelectedProject(project);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProject) return;
    try {
      await apiClient.delete(`/projects/${selectedProject.id}`);
      useNotificationStore.getState().addNotification({
        title: "Success",
        message: "Project deleted successfully",
      });
      fetchProjects();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteOpen(false);
      setSelectedProject(null);
    }
  };

  return (
    <div className="space-y-xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-text-primary">Projects</h1>
          <p className="text-body-md text-text-secondary">
            Manage your construction projects.
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedProject(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-sm h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="rounded-md border border-border-default bg-surface-base">
        {loading ? (
          <LoadingState message="Loading projects..." />
        ) : projects.length === 0 ? (
          <EmptyState
            title="No projects found"
            description="Get started by creating a new project."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedProject(null);
                  setDialogOpen(true);
                }}
              >
                Create Project
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Actual Cost</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">
                    <div>{project.name}</div>
                    {project.description && (
                      <div className="text-body-sm text-text-muted">
                        {project.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={project.status === "ACTIVE" ? "risk-neutral" : "default"}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    ${Number(project.budget).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    ${Number(project.actualCost).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="text-body-sm">
                      {format(new Date(project.startDate), "MMM d, yyyy")} -{" "}
                      {format(new Date(project.endDate), "MMM d, yyyy")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded-sm p-1 text-text-muted hover:bg-surface-raised hover:text-text-primary">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(project)}>
                          <Edit className="mr-sm h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-risk-critical-text focus:text-risk-critical-text"
                          onClick={() => handleDeleteClick(project)}
                        >
                          <Trash className="mr-sm h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {dialogOpen && (
        <ProjectDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          project={selectedProject}
          onSuccess={() => {
            fetchProjects();
            setDialogOpen(false);
          }}
        />
      )}

      {deleteOpen && (
        <DeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onConfirm={handleDeleteConfirm}
          itemName={selectedProject?.name || "Project"}
        />
      )}
    </div>
  );
}
