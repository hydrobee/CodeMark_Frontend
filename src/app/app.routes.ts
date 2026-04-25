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
import { ManageUsers } from './pages/dashboard/admin/manage-users/manage-users';
import { SystemLog } from './pages/dashboard/admin/system-log/system-log';
import { SystemData } from './pages/dashboard/admin/system-data/system-data';
import { AdminNotification } from './pages/dashboard/admin/admin-notification/admin-notification';
import { AllUsers } from './pages/dashboard/admin/all-users/all-users';
import { ApproveLecturer } from './pages/dashboard/admin/approve-lecturer/approve-lecturer';
import { ResetCredential } from './pages/dashboard/admin/reset-credential/reset-credential';
import { DeleteUser } from './pages/dashboard/admin/delete-user/delete-user';
import { Support } from './pages/dashboard/student/support/support';
import { SupportLecturer } from './pages/dashboard/lecturer/support-lecturer/support-lecturer';
import { EditAssignmentForm } from './pages/dashboard/lecturer/edit-assignment-form/edit-assignment-form';

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
  { path: 'manage-users', component: ManageUsers},
  { path: 'system-log', component: SystemLog},
  { path: 'system-data', component: SystemData}, 
  { path: 'admin-notification', component: AdminNotification },
  { path: 'all-users', component: AllUsers},
  { path: 'approve-lecturer', component: ApproveLecturer},
  { path: 'reset-credential', component: ResetCredential},
  { path: 'delete-user', component: DeleteUser},
  { path: 'support', component: Support},
  { path: 'support-lecturer', component: SupportLecturer},
  { path: 'edit-assignment-form/:id', component: EditAssignmentForm},
  { path: '**', redirectTo: 'login' },
];
