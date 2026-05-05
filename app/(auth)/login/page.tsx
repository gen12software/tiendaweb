import LoginForm from './LoginForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; error?: string; message?: string }>
}) {
  const params = await searchParams
  return <LoginForm redirectTo={params.redirectTo} urlError={params.error} urlMessage={params.message} />
}
