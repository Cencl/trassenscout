import { Routes as PageRoutes } from "@blitzjs/next"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { startOfDay } from "date-fns"
import { Suspense } from "react"
import { Link } from "src/core/components/links/Link"
import { DateList } from "../../rs8/termine/components/Calender/DateList"
import getCalendarEntries from "../queries/getCalendarEntries"

const CalendarDashboardDateList: React.FC = () => {
  const [{ calendarEntries }] = usePaginatedQuery(getCalendarEntries, {
    orderBy: { startAt: "asc" },
    take: 3,
    where: {
      startAt: {
        gte: startOfDay(new Date()),
      },
    },
  })

  return <DateList calendarEntries={calendarEntries} />
}

export const CalenderDashboard: React.FC = () => {
  return (
    <section className="my-12 space-y-6 md:max-w-prose">
      <h2 className="mb-2 text-3xl font-bold">Kommende Termine</h2>
      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <CalendarDashboardDateList />
      </Suspense>
      <p className="mt-5">
        <Link button href={PageRoutes.CalendarEntriesPage()}>
          Alle Termine
        </Link>
      </p>
    </section>
  )
}
