"use client";

import { useState } from "react";
import {
  createLessonAction,
  createModuleAction,
  deleteLessonAction,
  deleteModuleAction,
  updateLessonAction,
  updateModuleAction,
} from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, GripVertical, FileVideo, FileText, Play, Link as LinkIcon, FileCheck, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const lessonTypes = ["TEXT", "YOUTUBE", "VIDEO", "PDF", "LINK", "ASSIGNMENT", "QUIZ"] as const;

type LessonType = typeof lessonTypes[number];

const LessonIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "YOUTUBE":
    case "VIDEO":
      return <FileVideo className="w-4 h-4 text-primary" />;
    case "TEXT":
    case "PDF":
      return <FileText className="w-4 h-4 text-blue-500" />;
    case "LINK":
      return <LinkIcon className="w-4 h-4 text-muted-foreground" />;
    case "ASSIGNMENT":
      return <FileCheck className="w-4 h-4 text-orange-500" />;
    case "QUIZ":
      return <HelpCircle className="w-4 h-4 text-green-500" />;
    default:
      return <Play className="w-4 h-4" />;
  }
};

export function CurriculumBuilder({ course }: { course: any }) {
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);
  const [openLessonId, setOpenLessonId] = useState<string | null>(null);
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [addLessonModuleId, setAddLessonModuleId] = useState<string | null>(null);

  const modules = course.modules || [];

  return (
    <div className="space-y-6">
      {modules.length === 0 ? (
        <div className="text-center p-12 border border-dashed bg-card text-muted-foreground">
          <p className="mb-4">No modules added yet.</p>
          <Button onClick={() => setIsAddModuleOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create first module
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {modules.map((courseModule: any) => (
            <Card key={courseModule.id} className="overflow-hidden border-border bg-card shadow-sm">
              <div className="bg-muted/50 p-4 border-b flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary w-8 h-8 flex items-center justify-center font-bold text-sm shrink-0">
                    {courseModule.order}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{courseModule.title}</h3>
                    {courseModule.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{courseModule.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Dialog open={openModuleId === courseModule.id} onOpenChange={(open) => setOpenModuleId(open ? courseModule.id : null)}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Edit Module</DialogTitle>
                      </DialogHeader>
                      <form action={updateModuleAction} className="mt-2 space-y-4" onSubmit={() => setOpenModuleId(null)}>
                        <input type="hidden" name="id" value={courseModule.id} />
                        <div><Label>Title</Label><Input name="title" defaultValue={courseModule.title} required /></div>
                        <div><Label>Order</Label><Input name="order" type="number" min={1} defaultValue={courseModule.order} required /></div>
                        <div><Label>Description</Label><Textarea name="description" defaultValue={courseModule.description ?? ""} /></div>
                        <div className="flex justify-between items-center pt-4 border-t">
                          <SubmitButton size="sm" pendingText="Saving...">Save Changes</SubmitButton>
                        </div>
                      </form>
                      <form action={deleteModuleAction} className="absolute left-6 bottom-6" onSubmit={() => setOpenModuleId(null)}>
                        <input type="hidden" name="id" value={courseModule.id} />
                        <SubmitButton variant="destructive" size="sm" pendingText="Deleting...">Delete</SubmitButton>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="p-0">
                {courseModule.lessons.length > 0 ? (
                  <div className="divide-y divide-border">
                    {courseModule.lessons.map((lesson: any) => (
                      <div key={lesson.id} className="p-3 pl-14 hover:bg-muted/30 transition-colors flex justify-between items-center group">
                        <div className="flex items-center gap-3">
                          <div className="w-6 flex justify-center text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical className="w-4 h-4" />
                          </div>
                          <LessonIcon type={lesson.type} />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {lesson.order}. {lesson.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="neutral" className="text-[10px] px-1.5 py-0 h-4 bg-muted text-muted-foreground border-transparent">
                                {lesson.type}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">{lesson.estimatedMinutes} min</span>
                              {lesson.completionRequired && (
                                <span className="text-[10px] text-primary bg-primary/10 px-1 rounded font-medium">Required</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <Dialog open={openLessonId === lesson.id} onOpenChange={(open) => setOpenLessonId(open ? lesson.id : null)}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground">
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit Lesson</DialogTitle>
                            </DialogHeader>
                            <form action={updateLessonAction} className="mt-2 space-y-4" onSubmit={() => setOpenLessonId(null)}>
                              <input type="hidden" name="id" value={lesson.id} />
                              <div className="grid grid-cols-2 gap-4">
                                <div><Label>Title</Label><Input name="title" defaultValue={lesson.title} required /></div>
                                <div><Label>Type</Label>
                                  <Select name="type" defaultValue={lesson.type}>
                                    {lessonTypes.map((type) => <option key={type}>{type}</option>)}
                                  </Select>
                                </div>
                              </div>
                              <div><Label>Content / Instructions</Label><Textarea name="content" defaultValue={lesson.content ?? ""} className="min-h-[100px]" /></div>
                              <div className="grid grid-cols-2 gap-4">
                                <div><Label>YouTube URL</Label><Input name="videoUrl" defaultValue={lesson.videoUrl ?? ""} /></div>
                                <div><Label>External URL</Label><Input name="externalUrl" defaultValue={lesson.externalUrl ?? ""} /></div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div><Label>Order</Label><Input name="order" type="number" min={1} defaultValue={lesson.order} /></div>
                                <div><Label>Estimated Minutes</Label><Input name="estimatedMinutes" type="number" min={1} defaultValue={lesson.estimatedMinutes} /></div>
                              </div>
                              <div className="pt-2">
                                <label className="flex items-center gap-2 text-sm font-medium">
                                  <input type="checkbox" name="completionRequired" defaultChecked={lesson.completionRequired} className="w-4 h-4 rounded border-gray-300" /> 
                                  Required for completion
                                </label>
                              </div>
                              <div className="flex justify-between pt-4 border-t mt-6">
                                <SubmitButton pendingText="Saving...">Save Lesson</SubmitButton>
                              </div>
                            </form>
                            <form action={deleteLessonAction} className="absolute left-6 bottom-6" onSubmit={() => setOpenLessonId(null)}>
                              <input type="hidden" name="id" value={lesson.id} />
                              <SubmitButton variant="destructive" size="sm" pendingText="Deleting...">Delete</SubmitButton>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground p-4 pl-14 bg-muted/10 italic">No lessons in this module yet.</p>
                )}
                
                <div className="p-3 pl-14 bg-muted/5 border-t">
                  <Dialog open={addLessonModuleId === courseModule.id} onOpenChange={(open) => setAddLessonModuleId(open ? courseModule.id : null)}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/10 -ml-2">
                        <Plus className="w-4 h-4 mr-1.5" /> Add Lesson
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add New Lesson</DialogTitle>
                      </DialogHeader>
                      <form action={createLessonAction} className="mt-2 space-y-4" onSubmit={() => setAddLessonModuleId(null)}>
                        <input type="hidden" name="moduleId" value={courseModule.id} />
                        <div className="grid grid-cols-2 gap-4">
                          <div><Label>Title</Label><Input name="title" required placeholder="e.g. Introduction to Variables" /></div>
                          <div><Label>Type</Label>
                            <Select name="type" defaultValue="VIDEO">
                              {lessonTypes.map((type) => <option key={type}>{type}</option>)}
                            </Select>
                          </div>
                        </div>
                        <div><Label>Content / Instructions</Label><Textarea name="content" className="min-h-[100px]" placeholder="Optional reading material or instructions..." /></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div><Label>YouTube URL</Label><Input name="videoUrl" placeholder="https://youtube.com/watch?v=..." /></div>
                          <div><Label>External URL</Label><Input name="externalUrl" placeholder="https://..." /></div>
                        </div>
                        <div><Label>Lesson File</Label><Input name="file" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,image/*,video/*" /></div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div><Label>Order</Label><Input name="order" type="number" min={1} defaultValue={(courseModule.lessons?.length || 0) + 1} /></div>
                          <div><Label>Estimated Minutes</Label><Input name="estimatedMinutes" type="number" min={1} defaultValue={10} /></div>
                        </div>
                        <div className="pt-2">
                          <label className="flex items-center gap-2 text-sm font-medium">
                            <input type="checkbox" name="completionRequired" defaultChecked className="w-4 h-4 rounded border-gray-300" /> 
                            Required for completion
                          </label>
                        </div>
                        <div className="pt-4 border-t mt-6">
                          <SubmitButton pendingText="Adding...">Add Lesson</SubmitButton>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </Card>
          ))}

          <Dialog open={isAddModuleOpen} onOpenChange={setIsAddModuleOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full border-dashed">
                <Plus className="w-4 h-4 mr-2" /> Add Module
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Module</DialogTitle>
              </DialogHeader>
              <form action={createModuleAction} className="mt-2 space-y-4" onSubmit={() => setIsAddModuleOpen(false)}>
                <input type="hidden" name="courseId" value={course.id} />
                <div><Label>Title</Label><Input name="title" required placeholder="e.g. Getting Started" /></div>
                <div><Label>Description</Label><Textarea name="description" placeholder="Brief overview of what this module covers..." /></div>
                <div><Label>Order</Label><Input name="order" type="number" min={1} defaultValue={modules.length + 1} /></div>
                <div className="pt-4 border-t mt-6">
                  <SubmitButton pendingText="Adding...">Create Module</SubmitButton>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
