"use client";

import type { LucideIcon } from "lucide-react";
import {
  Settings2,
  School,
  GraduationCap,
  Users,
  LayoutDashboard,
  CreditCard,
  DollarSign,
  LogOut,
  Banknote,
  Receipt,
  Briefcase,
  MessageSquare,
  FileText
} from "lucide-react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import { TeamSwitcher } from "@/components/sidebar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import type { UserRole } from "@/types";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "@/hooks/AuthProvider";
import { useMemo } from "react";
import { toast } from "sonner";
import { api, baseURL } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToogle } from "./ThemeToogle";

export interface NavItem {
  title: string;
  url: string; // Used for linking and active state matching
  icon?: LucideIcon;
  isActive?: boolean; // Default open state for collapsibles
  roles?: UserRole[]; // Who can see this section? (undefined = everyone)
  items?: {
    title: string;
    url: string;
    icon?: LucideIcon; // Added icon to sub-items
    roles?: UserRole[]; // Who can see this specific link?
  }[];
}

// This is sample data.
export const sidebardata = {
  teams: [
    {
      name: "Firstborn Technologies",
      logo: School,
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      roles: ["admin", "teacher", "student", "parent"],
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          roles: ["admin", "teacher", "student", "parent"],
        },
        {
          title: "Activities Log",
          url: "/activities-log",
          roles: ["admin"], // Restricted to Admin
        },
      ],
    },
    {
      title: "Academics",
      url: "#", // Parent item, no link
      icon: School,
      roles: ["admin", "teacher", "student", "parent"],
      items: [
        {
          title: "Classes",
          url: "/classes",
          roles: ["admin", "teacher"],
        },
        {
          title: "Subjects",
          url: "/subjects",
          roles: ["admin", "teacher"],
        },
        {
          title: "Timetable",
          url: "/timetable",
        },
        {
          title: "My Schedule",
          url: "/teacher-timetable",
          roles: ["teacher"],
        },
        {
          title: "Attendance",
          url: "/attendance",
          roles: ["admin", "teacher", "student"],
        },
        {
          title: "Marks Entry",
          url: "/academics/marks-entry",
          roles: ["admin", "teacher"],
        },
        {
          title: "Report Cards",
          url: "/academics/report-cards",
          roles: ["admin", "teacher"],
        },
        {
          title: "My Report Card",
          url: "/academics/my-report-card",
          roles: ["student", "parent"],
        },
      ],
    },
    {
      title: "Learning (LMS)",
      url: "#",
      icon: GraduationCap,
      roles: ["teacher", "student", "admin"], // Parents usually don't need deep LMS access
      items: [
        { title: "Assignments", url: "/lms/assignments" },
        { title: "Exams", url: "/lms/exams" },
        { title: "Study Materials", url: "/lms/materials" },
      ],
    },
    {
      title: "People",
      url: "#",
      icon: Users,
      roles: ["admin", "teacher"],
      items: [
        { title: "Students", url: "/users/students" },
        {
          title: "Teachers",
          url: "/users/teachers",
          roles: ["admin"], // Only Admin can see other Admins
        },
        {
          title: "Parents",
          url: "/users/parents",
          roles: ["admin"], // Only Admin can see other Admins
        },
        {
          title: "Admins",
          url: "/users/admins",
          roles: ["admin"], // Only Admin can see other Admins
        },
        {
          title: "Admission Leads",
          url: "/users/leads",
          roles: ["admin"], // Lead management requires global admin rights
        },
      ],
    },
    {
      title: "Finance",
      url: "#",
      icon: Banknote,
      roles: ["admin", "teacher", "student", "parent"],
      items: [
        { title: "Fee Collection", url: "/finance/fees", icon: DollarSign, roles: ["admin", "teacher"] },
        { title: "Receipts & Ledger", url: "/finance/receipts", icon: Banknote, roles: ["admin"] },
        { title: "Expenses Tracker", url: "/finance/expenses", icon: CreditCard, roles: ["admin"] },
        { title: "My Receipts", url: "/finance/my-receipts", icon: Receipt, roles: ["student", "parent"] },
        { title: "My Invoices", url: "/finance/my-fees", icon: CreditCard, roles: ["student", "parent"] },
      ],
    },
    {
      title: "ID Management",
      url: "#",
      icon: CreditCard,
      roles: ["admin"],
      items: [
        { title: "ID Designer", url: "/id-cards/designer" },
        { title: "Bulk Generator", url: "/id-cards/generate" },
        { title: "Single ID Printer", url: "/id-cards/printer" },
      ],
    },
    {
      title: "HR & Recruitment",
      url: "#",
      icon: Briefcase,
      roles: ["admin"],
      items: [
        { title: "Offer Letters", url: "/offer-letters" },
      ],
    },
    {
      title: "Helpdesk",
      url: "#",
      icon: MessageSquare,
      roles: ["admin", "teacher", "student"],
      items: [
        { title: "My Complaints", url: "/helpdesk/my-complaints", roles: ["student"] },
        { title: "My Leaves", url: "/helpdesk/my-leaves", roles: ["teacher"] },
        { title: "Assigned Complaints", url: "/helpdesk/assigned-complaints", roles: ["teacher"] },
        { title: "Manage Complaints", url: "/helpdesk/manage-complaints", roles: ["admin"] },
        { title: "Manage Leaves", url: "/helpdesk/manage-leaves", roles: ["admin"] },
      ],
    },
    {
      title: "System",
      url: "#",
      icon: Settings2,
      roles: ["admin"],
      items: [
        { title: "School Settings", url: "/settings/school" }, // Fixed router target
        { title: "Academic Years", url: "/settings/academic-years" },
        { title: "Exam Terms", url: "/settings/exam-terms" },
        { title: "Roles & Permissions", url: "/settings/roles" },
      ],
    },
    {
      title: "CMS",
      url: "#",
      icon: FileText,
      roles: ["admin"],
      items: [
        { title: "Blog Posts", url: "/cms/blog" },
      ],
    },
  ] as NavItem[],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, year, setUser } = useAuth();
  const location = useLocation(); // <--- Get current URL
  const pathname = location.pathname; // e.g., "/dashboard/analytics"
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const navigate = useNavigate();

  const displayPhoto = user?.photoUrl?.startsWith('http')
    ? user.photoUrl
    : user?.photoUrl ? `${baseURL}${user.photoUrl}` : "";

  const userData = {
    name: user?.name || "User",
    email: user?.email || "",
    avatar: displayPhoto,
  };

  const userRole = (user?.role || "student") as UserRole;

  const filteredNav = useMemo(() => {
    return sidebardata.navMain
      .filter((item) => !item.roles || item.roles.includes(userRole))
      .map((item) => {
        const isChildActive = item.items?.some((sub) => sub.url === pathname);
        const isMainActive = item.url === pathname;
        return {
          ...item,
          isActive: isMainActive || isChildActive,
          items: item.items
            ?.filter(
              (subItem) => !subItem.roles || subItem.roles.includes(userRole),
            )
            .map((subItem) => ({
              ...subItem,
              isActive: subItem.url === pathname,
            })),
        };
      });
  }, [pathname, userRole]);

  const logout = async () => {
    try {
      await api.post("/users/logout").finally(() => {
        setUser(null);
        navigate("/login");
        toast.success("Logged out successfully");
      });
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebardata.teams} yearName={year?.name!} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNav} />
      </SidebarContent>
      <SidebarFooter>
        <div
          className={cn(
            "gap-2",
            isCollapsed ? "flex-row space-y-2" : "flex justify-between",
          )}
        >
          <SidebarMenuItem title="Logout">
            <Button onClick={logout} variant={"ghost"} size="icon-sm">
              <LogOut />
            </Button>
          </SidebarMenuItem>
          <ThemeToogle />
        </div>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
