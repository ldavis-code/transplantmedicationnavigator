import { AdminGuard } from "../../middleware/adminGuard";
import { ComplianceDashboard } from "../../components/compliance/ComplianceDashboard";
export default function CompliancePage() {
  return (
    <AdminGuard>
      <ComplianceDashboard />
    </AdminGuard>
  );
}
