import PricingApp from "./components/PricingApp";
import AuthGate from "./components/AuthGate";

export default function Page() {
  return (
    <AuthGate>
      <PricingApp />
    </AuthGate>
  );
}