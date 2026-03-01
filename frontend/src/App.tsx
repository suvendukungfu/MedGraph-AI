import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { AppLayout } from './components/common/AppLayout'
import { LoadingState } from './components/common/LoadingState'
import { RoleGuard } from './components/common/RoleGuard'
import { AuthGuard } from './components/common/AuthGuard'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { OnboardingPage } from './pages/OnboardingPage'

const PrescriptionUploadPage = lazy(() =>
  import('./pages/PrescriptionUploadPage').then((module) => ({
    default: module.PrescriptionUploadPage,
  })),
)

const RiskDashboardPage = lazy(() =>
  import('./pages/RiskDashboardPage').then((module) => ({
    default: module.RiskDashboardPage,
  })),
)

const ArchitectureBlueprintPage = lazy(() =>
  import('./pages/ArchitectureBlueprintPage').then((module) => ({
    default: module.ArchitectureBlueprintPage,
  })),
)

const RoleHubPage = lazy(() =>
  import('./pages/RoleHubPage').then((module) => ({
    default: module.RoleHubPage,
  })),
)

const AdminDashboardPage = lazy(() =>
  import('./pages/roles/AdminDashboardPage').then((module) => ({
    default: module.AdminDashboardPage,
  })),
)

const DoctorDashboardPage = lazy(() =>
  import('./pages/roles/DoctorDashboardPage').then((module) => ({
    default: module.DoctorDashboardPage,
  })),
)

const PatientDashboardPage = lazy(() =>
  import('./pages/roles/PatientDashboardPage').then((module) => ({
    default: module.PatientDashboardPage,
  })),
)

const CaretakerDashboardPage = lazy(() =>
  import('./pages/roles/CaretakerDashboardPage').then((module) => ({
    default: module.CaretakerDashboardPage,
  })),
)

import { Toaster } from 'sonner'

const App = () => {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl p-6">
          <LoadingState />
        </div>
      }
    >
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />

        <Route
          element={
            <AuthGuard>
              <AppLayout />
            </AuthGuard>
          }
        >
          <Route path="/" element={<PrescriptionUploadPage />} />
          <Route path="/dashboard" element={<RiskDashboardPage />} />
          <Route path="/architecture" element={<ArchitectureBlueprintPage />} />
          <Route path="/roles" element={<RoleHubPage />} />

          <Route
            path="/roles/admin"
            element={
              <RoleGuard allowedRoles={['admin']}>
                <AdminDashboardPage />
              </RoleGuard>
            }
          />
          <Route
            path="/roles/doctor"
            element={
              <RoleGuard allowedRoles={['doctor']}>
                <DoctorDashboardPage />
              </RoleGuard>
            }
          />
          <Route
            path="/roles/patient"
            element={
              <RoleGuard allowedRoles={['patient']}>
                <PatientDashboardPage />
              </RoleGuard>
            }
          />
          <Route
            path="/roles/caretaker"
            element={
              <RoleGuard allowedRoles={['caretaker']}>
                <CaretakerDashboardPage />
              </RoleGuard>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App

// chore(lint): resolve minor hydration warnings in React rendering engine
