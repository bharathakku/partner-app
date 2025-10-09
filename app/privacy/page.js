export const metadata = { title: 'Privacy Policy - YourDelivery Partner' }

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50 p-6">
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-xl p-6 prose prose-slate">
        <h1 className="!mt-0">Privacy Policy</h1>
        <p>This policy explains how YourDelivery collects, uses, and protects partner information.</p>
        <h2>Information We Collect</h2>
        <ul>
          <li>Profile data such as name, phone, and email.</li>
          <li>Operational data like delivery locations and timestamps.</li>
          <li>Device information to secure your account and improve performance.</li>
        </ul>
        <h2>How We Use Information</h2>
        <ul>
          <li>To operate the delivery platform and provide support.</li>
          <li>To process payouts and manage subscriptions.</li>
          <li>To improve reliability, safety and compliance.</li>
        </ul>
        <h2>Data Sharing</h2>
        <p>We do not sell personal data. We may share with service providers (e.g., payments, communications) under strict agreements.</p>
        <h2>Data Retention</h2>
        <p>Data is retained as long as needed for operations and legal compliance, after which it is securely deleted or anonymized.</p>
        <h2>Your Choices</h2>
        <ul>
          <li>Update profile information in the app.</li>
          <li>Manage notifications and analytics in App Settings.</li>
          <li>Contact support to request account deletion subject to legal obligations.</li>
        </ul>
        <h2>Contact</h2>
        <p>For privacy questions, contact support via the app.</p>
      </div>
    </div>
  )
}
