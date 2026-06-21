import { createBrowserRouter } from "react-router"; // Keeping your requested import
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import PrivateRoutes from "@/pages/routes/PrivateRoutes";
import Dashboard from "@/pages/Dashboard";
import ActivitiesLog from "@/pages/ActivitiesLog";
import AcademicYear from "@/pages/settings/academic-year";
import SchoolSettings from "@/pages/settings/school-settings";
import RolesAndPermissions from "@/pages/settings/roles";
import ExamTerms from "@/pages/settings/exam-terms";
import FeeCollection from "@/pages/finance/FeeCollection";
import FeeCategories from "@/pages/finance/FeeCategories";
import MyFees from "@/pages/finance/MyFees";
import UserManagementPage from "@/pages/users";
import Classes from "@/pages/academics/Classes";
import { Subjects } from "@/pages/academics/Subjects";
import Timetable from "@/pages/academics/Timetable";
import { TeacherTimetable } from "@/pages/academics/TeacherTimetable";
import Attendance from "@/pages/academics/Attendance";
import Exams from "@/pages/lms/Exams";
import Exam from "../lms/Exam";
import Assignments from "@/pages/lms/Assignments";
import AssignmentDetails from "../lms/AssignmentDetails";
import Materials from "@/pages/lms/Materials";
import IdDesigner from "@/pages/admin/IdDesigner";
import IdGenerator from "@/pages/admin/IdGenerator";
import StudentIdPrinter from "@/pages/admin/StudentIdPrinter";
import OfferLetters from "@/pages/admin/OfferLetters";
import PaymentReceipts from "@/pages/admin/PaymentReceipts";
import MyPayments from "@/pages/student/MyPayments";
import ExpensesManagementPage from "../finance/Expenses";
import VerifyReceipt from "@/pages/public/VerifyReceipt";
import { MyComplaints } from "@/pages/student/MyComplaints";
import { MyLeaves } from "@/pages/teacher/MyLeaves";
import { AssignedComplaints } from "@/pages/teacher/AssignedComplaints";
import { ManageComplaints } from "@/pages/admin/ManageComplaints";
import { ManageLeaves } from "@/pages/admin/ManageLeaves";
import { BlogManagement } from "@/pages/admin/BlogManagement";
import { BlogDetails } from "@/pages/BlogDetails";
import BlogList from "@/pages/BlogList";
import MarksEntry from "@/pages/admin/MarksEntry";
import ReportCardView from "@/pages/ReportCardView";
import MyReportCard from "@/pages/student/MyReportCard";
import ProfilePage from "@/pages/ProfilePage";
import InquiriesPage from "@/pages/admin/Inquiries";

export const router = createBrowserRouter([
  {
    children: [
      // public routes
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "verify-receipt/:id", element: <VerifyReceipt /> },
      { path: "blog/:slug", element: <BlogDetails /> },
      { path: "blog", element: <BlogList /> },
      // protected routes would go here
      {
        element: <PrivateRoutes />, // Assuming PrivateRoutes is imported
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "profile", element: <ProfilePage /> },
          { path: "activities-log", element: <ActivitiesLog /> },
          { path: "settings/academic-years", element: <AcademicYear /> },
          { path: "settings/exam-terms", element: <ExamTerms /> },
          { path: "settings/school", element: <SchoolSettings /> },
          { path: "settings/roles", element: <RolesAndPermissions /> },
          { path: "finance/fees", element: <FeeCollection /> },
          { path: "finance/categories", element: <FeeCategories /> },
          { path: "finance/receipts", element: <PaymentReceipts /> },
          { path: "finance/expenses", element: <ExpensesManagementPage /> },
          { path: "finance/my-receipts", element: <MyPayments /> },
          { path: "finance/my-fees", element: <MyFees /> },
          {
            path: "users/students",
            element: (
              <UserManagementPage
                role="student"
                title="Students"
                description="Manage student directory and class assignments."
              />
            ),
          },
          {
            path: "users/teachers",
            element: (
              <UserManagementPage
                role="teacher"
                title="Teachers"
                description="Manage teaching staff."
              />
            ),
          },
          {
            path: "users/parents",
            element: (
              <UserManagementPage
                role="parent"
                title="Parents"
                description="Manage Parents."
              />
            ),
          },
          {
            path: "users/admins",
            element: (
              <UserManagementPage
                role="admin"
                title="Admins"
                description="Manage Admins."
              />
            ),
          },
          {
            path: "users/leads",
            element: <InquiriesPage />,
          },
          {
            path: "classes",
            element: <Classes />,
          },
          {
            path: "subjects",
            element: <Subjects />,
          },
          {
            path: "timetable",
            element: <Timetable />,
          },
          {
            path: "teacher-timetable",
            element: <TeacherTimetable />,
          },
          {
            path: "attendance",
            element: <Attendance />,
          },
          {
            path: "lms/assignments",
            element: <Assignments />,
          },
          {
            path: "lms/assignments/:id",
            element: <AssignmentDetails />,
          },
          {
            path: "lms/materials",
            element: <Materials />,
          },
          {
            path: "lms/exams",
            element: <Exams />,
          },
          {
            path: "lms/exams/:id",
            element: <Exam />,
          },
          {
            path: "id-cards/designer",
            element: <IdDesigner />,
          },
          {
            path: "id-cards/generate",
            element: <IdGenerator />,
          },
          {
            path: "id-cards/printer",
            element: <StudentIdPrinter />,
          },
          {
            path: "offer-letters",
            element: <OfferLetters />,
          },
          {
            path: "helpdesk/my-complaints",
            element: <MyComplaints />,
          },
          {
            path: "helpdesk/my-leaves",
            element: <MyLeaves />,
          },
          {
            path: "helpdesk/assigned-complaints",
            element: <AssignedComplaints />,
          },
          {
            path: "helpdesk/manage-complaints",
            element: <ManageComplaints />,
          },
          {
            path: "helpdesk/manage-leaves",
            element: <ManageLeaves />,
          },
          {
            path: "cms/blog",
            element: <BlogManagement />,
          },
          {
            path: "academics/marks-entry",
            element: <MarksEntry />,
          },
          {
            path: "academics/report-cards",
            element: <ReportCardView />,
          },
          {
            path: "academics/my-report-card",
            element: <MyReportCard />,
          },
        ],
      },
    ],
  },
]);
