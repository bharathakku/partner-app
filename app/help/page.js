import { redirect } from 'next/navigation'

export default function HelpIndex() {
  // Alias /help -> /support
  redirect('/support')
}
