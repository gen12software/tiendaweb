import CheckEmailClient from './CheckEmailClient'

export default function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  return <CheckEmailClient searchParamsPromise={searchParams} />
}
