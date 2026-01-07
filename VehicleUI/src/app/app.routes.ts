import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';
import { customerGuard } from './guards/customer.guard';
import { technicianGuard } from './guards/technician.guard';
import { managerGuard } from './guards/manager.guard';
import { guestGuard } from './guards/guest.guard';

// Components
import { CustomerDashboardComponent } from './components/customer-dashboard/customer-dashboard';
import { AddVehicleComponent } from './components/add-vehicle/add-vehicle.component';
import { MyVehiclesComponent } from './components/my-vehicles/my-vehicles.component';
import { BookServiceComponent } from './components/book-service/book-service.component';
import { MyBookingsComponent } from './components/my-bookings/my-bookings.component';
import { ViewBillComponent } from './components/view-bill/view-bill.component';
import { MyBillsComponent } from './components/my-bills/my-bills.component';
import { TechnicianDashboardComponent } from './components/technician-dashboard/technician-dashboard.component';
import { ReportsComponent } from './components/reports/reports.component';

// Layouts
import { AdminLayoutComponent } from './components/admin/admin-layout.component';
import { CustomerLayoutComponent } from './components/customer-dashboard/customer-layout.component';
import { ManagerLayoutComponent } from './components/manager/manager-layout.component';
import { TechnicianLayoutComponent } from './components/technician-dashboard/technician-layout.component';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
    { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },

    // 🔹 CUSTOMER MODULE (SIDEBAR)
    {
        path: 'customer',
        component: CustomerLayoutComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Customer'] },
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: CustomerDashboardComponent },
            { path: 'profile', loadComponent: () => import('./components/shared/user-profile/user-profile.component').then(m => m.UserProfileComponent) },
            { path: 'add-vehicle', component: AddVehicleComponent },
            { path: 'my-vehicles', component: MyVehiclesComponent },
            { path: 'book-service', component: BookServiceComponent },
            { path: 'my-bookings', component: MyBookingsComponent },
            { path: 'view-bill', component: ViewBillComponent },
            { path: 'my-bills', component: MyBillsComponent },
            { path: 'notifications', loadComponent: () => import('./components/notifications/notifications.component').then(m => m.NotificationsComponent) }
        ]
    },
    // Backward compat for customer dashboard direct link if any
    { path: 'customer-dashboard', redirectTo: 'customer/dashboard', pathMatch: 'full' },


    // 🔹 TECHNICIAN MODULE (SIDEBAR)
    {
        path: 'technician',
        component: TechnicianLayoutComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Technician'] },
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: TechnicianDashboardComponent },
            { path: 'profile', loadComponent: () => import('./components/shared/user-profile/user-profile.component').then(m => m.UserProfileComponent) },
            { path: 'notifications', loadComponent: () => import('./components/notifications/notifications.component').then(m => m.NotificationsComponent) }
        ]
    },
    { path: 'technician-dashboard', redirectTo: 'technician/dashboard', pathMatch: 'full' },


    // 🔹 MANAGER MODULE (SIDEBAR)
    {
        path: 'manager',
        component: ManagerLayoutComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Manager'] },
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', loadComponent: () => import('./components/manager/manager-dashboard.component').then(m => m.ManagerDashboardComponent) },
            { path: 'profile', loadComponent: () => import('./components/shared/user-profile/user-profile.component').then(m => m.UserProfileComponent) },
            { path: 'assign', loadComponent: () => import('./components/manager/assign-technician.component').then(m => m.AssignTechnicianComponent) },
            { path: 'reports', loadComponent: () => import('./components/manager/manager-reports.component').then(m => m.ManagerReportsComponent) },
            {
                path: 'parts',
                loadComponent: () => import('./components/manager/parts/parts-inventory.component').then(m => m.PartsInventoryComponent)
            },
            { path: 'notifications', loadComponent: () => import('./components/notifications/notifications.component').then(m => m.NotificationsComponent) }
        ]
    },
    { path: 'manager-dashboard', redirectTo: 'manager/dashboard', pathMatch: 'full' },


    // 🔹 ADMIN MODULE (SIDEBAR)
    {
        path: 'admin',
        component: AdminLayoutComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Admin'] },
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                loadComponent: () => import('./components/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent)
            },
            { path: 'profile', loadComponent: () => import('./components/shared/user-profile/user-profile.component').then(m => m.UserProfileComponent) },
            {
                path: 'users',
                loadComponent: () => import('./components/admin/manage-users.component').then(m => m.ManageUsersComponent)
            },
            {
                path: 'categories',
                loadComponent: () => import('./components/admin/service-categories.component').then(m => m.ServiceCategoriesComponent)
            },
            {
                path: 'pricing',
                loadComponent: () => import('./components/admin/pricing.component').then(m => m.PricingComponent)
            },
            {
                path: 'notifications',
                loadComponent: () => import('./components/notifications/notifications.component').then(m => m.NotificationsComponent)
            }
        ]
    },
    { path: 'admin-dashboard', redirectTo: 'admin/dashboard', pathMatch: 'full' },

    {
        path: 'reports',
        component: ReportsComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Manager', 'Admin'] }
    },
    {
        path: 'notifications',
        loadComponent: () => import('./components/notifications/notifications.component').then(m => m.NotificationsComponent),
        canActivate: [authGuard]
    }
];
