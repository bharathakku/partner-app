export const metadata = { title: 'Terms and Conditions - YourDelivery Partner' }

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50 p-6">
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-xl p-6 prose prose-slate">
        <h1 className="!mt-0">Terms and Conditions</h1>
        <p>Welcome to YourDelivery Partner app. By accessing or using the services, you agree to the following terms.</p>
        <h2>1. Eligibility</h2>
        <p>You must be legally eligible to work and possess valid documents as required by local law.</p>
        <h2>2. Partner Responsibilities</h2>
        <ul>
          <li>Maintain accurate profile and vehicle information.</li>
          <li>Comply with traffic and safety regulations.</li>
          <li>Safeguard customer data and parcels.</li>
        </ul>
        <h2>3. Payments</h2>
        <p>Payouts are processed as per the payout schedule visible in the app. Deductions for penalties, fees or subscriptions may apply.</p>
        <h2>4. Account Suspension</h2>
        <p>We may suspend or terminate access for fraudulent activity, safety issues, or policy violations.</p>
        <h2>5. Changes</h2>
        <p>We may update these terms periodically. Continued use constitutes acceptance.</p>
        <h2>Contact</h2>
        <p>For questions, contact support via the app.</p>
      </div>
    </div>
  )
}
