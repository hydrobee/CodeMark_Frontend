import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'submit/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'student-feedback/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'review-details/:assignment_id',
    renderMode: RenderMode.Server
  },
  {
    path: 'review-approval/:feedback_id/:submission_id',
    renderMode: RenderMode.Server
  },
  {
    path: 'edit-assignment-form/:id',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];