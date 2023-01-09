import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import getContacts from "src/contacts/queries/getContacts"
import { Link } from "src/core/components/links"

const ITEMS_PER_PAGE = 100

export const ContactsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ contacts, hasMore }] = usePaginatedQuery(getContacts, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <div>
      <ul>
        {contacts.map((contact) => (
          <li key={contact.id}>
            <Link href={Routes.ShowContactPage({ contactId: contact.id })}>
              <a>{contact.name}</a>
            </Link>
          </li>
        ))}
      </ul>

      <button disabled={page === 0} onClick={goToPreviousPage}>
        Previous
      </button>
      <button disabled={!hasMore} onClick={goToNextPage}>
        Next
      </button>
    </div>
  )
}

const ContactsPage = () => {
  return (
    <LayoutArticle>
      <MetaTags noindex title="Kontakte" />
      <div>
        <h1>Kontakte</h1>
        <Suspense fallback={<div>Daten werden geladen…</div>}>
          <ContactsList />
        </Suspense>
        <p>
          <Link href={Routes.NewContactPage()}>Neuen Kontakt erstellen</Link>
        </p>
      </div>
    </LayoutArticle>
  )
}

export default ContactsPage
