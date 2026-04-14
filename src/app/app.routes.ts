import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Student } from './pages/dashboard/student/student dashboard/student';
import { Admin } from './pages/dashboard/admin/admin';
import { Lecturer } from './pages/dashboard/lecturer/lecturer-dashboard/lecturer';
import { Signal } from './signal/signal';
import { Submission } from './pages/dashboard/student/submission/submission';
import { FeedbackStudent } from './pages/dashboard/student/feedback/feedback-student/feedback-student';
import { StudentPerformance } from './pages/dashboard/student/performance/student-performance/student-performance';
import { Notifications } from './pages/dashboard/student/notification/notifications/notifications';
import { Submit } from './pages/dashboard/student/submit/submit';
import { FeedbackDetail } from './pages/dashboard/student/feedback-detail/feedback-detail';
import { LecturerReview } from './pages/dashboard/lecturer/lecturer-review/lecturer-review';
import { AssignmentManagement } from './pages/dashboard/lecturer/assignment-management/assignment-management';
import { LecturerPerformance } from './pages/dashboard/lecturer/lecturer-performance/lecturer-performance';
import { LecturerNotification } from './pages/dashboard/lecturer/lecturer-notification/lecturer-notification';
import { ReviewDetails } from './pages/dashboard/lecturer/review-details/review-details';
import { ReviewApproval } from './pages/dashboard/lecturer/review-approval/review-approval';
import { CreateAssignmentComponent } from './pages/dashboard/lecturer/create-assignment/create-assignment';
import { EditAssignment } from './pages/dashboard/lecturer/edit-assignment/edit-assignment';
import { ViewAssignment } from './pages/dashboard/lecturer/view-assignment/view-assignment';
import { DeleteAssignment } from './pages/dashboard/lecturer/delete-assignment/delete-assignment';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'student-dashboard', component: Student },
  { path: 'lecturer-dashboard', component: Lecturer },
  { path: 'admin', component: Admin },
  { path: 'signal', component: Signal },
  { path: 'student-submission', component: Submission },
  { path: 'student-feedback', component: FeedbackStudent },
  { path: 'student-performance', component: StudentPerformance },
  { path: 'student-notification', component: Notifications },
  { path: 'submit/:id', component: Submit },
  { path: 'student-feedback/:id', component: FeedbackDetail },
  { path: 'lecturer-review', component: LecturerReview },
  { path: 'review-details/:assignment_id', component: ReviewDetails },
  { path: 'assignment-management', component: AssignmentManagement },
  { path: 'lecturer-performance', component: LecturerPerformance },
  { path: 'lecturer-notification', component: LecturerNotification },
  { path: 'review-approval/:feedback_id/:submission_id', component: ReviewApproval },
  { path: 'create-assignment', component: CreateAssignmentComponent },
  { path: 'edit-assignment', component: EditAssignment },
  { path: 'view-assignment', component: ViewAssignment },
  { path: 'delete-assignment', component: DeleteAssignment },
  { path: '**', redirectTo: 'login' },
];
