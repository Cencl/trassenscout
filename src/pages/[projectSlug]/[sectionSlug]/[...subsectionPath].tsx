import { BlitzPage, Routes } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { Position } from "@turf/helpers"
import { useRouter } from "next/router"
import { Suspense } from "react"

import {
  Subsection as SubsectionClient,
  Subsubsection as SubsubsectionClient,
} from "@prisma/client"
import { SuperAdminLogData } from "src/core/components/AdminBox/SuperAdminLogData"
import { Markdown } from "src/core/components/Markdown/Markdown"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { Link } from "src/core/components/links"
import { useSlugs } from "src/core/hooks"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { ProjectMapSections } from "src/projects/components/Map"
import { SubsectionMap } from "src/projects/components/Map/SubsectionMap"
import { SubsubsectionSidebar } from "src/projects/components/Map/SubsubsectionSidebar"
import getSections from "src/sections/queries/getSections"
import { SubsubsectionTable } from "src/subsections/components/SubsubsectionTable"
import getSubsection from "src/subsections/queries/getSubsection"
import { Breadcrumb } from "src/core/components/Breadcrumb/Breadcrumb"
import { PageDescription } from "src/core/components/pages/PageDescription"
import invariant from "tiny-invariant"
import getStakeholdernotes from "src/stakeholdernotes/queries/getStakeholdernotes"
import { StakeholderSummary } from "src/stakeholdernotes/components/StakeholderSummary"
import { StakeholderSection } from "src/stakeholdernotes/components/StakeholderSection"

export type Subsubsection = Omit<SubsubsectionClient, "geometry"> & {
  geometry: Position[]
}

export type Subsection = Omit<SubsectionClient, "geometry"> & {
  geometry: Position[]
  subsubsections: Subsubsection[]
}

export const SubsectionDashboardWithQuery = () => {
  const router = useRouter()
  const { projectSlug, sectionSlug, subsectionSlug, subsubsectionSlug } = useSlugs()

  const [{ sections }] = useQuery(getSections, {
    where: { project: { slug: projectSlug! } },
    orderBy: { index: "asc" },
    include: { subsections: true },
  })
  const [subsectionOrg] = useQuery(getSubsection, {
    projectSlug: projectSlug!,
    sectionSlug: sectionSlug!,
    subsectionSlug: subsectionSlug!,
    includeSubsubsections: true,
  })
  const [{ stakeholdernotes }] = useQuery(getStakeholdernotes, {
    subsectionId: subsectionOrg.id,
    orderBy: { id: "asc" },
  })

  const parseGeometry = (objectWithGeometry: Record<any, any>) => {
    let parsedGeometry = undefined
    try {
      parsedGeometry = JSON.parse(objectWithGeometry.geometry) as Position[]
    } catch (e: any) {
      console.error("Parsing :", e.message, JSON.parse(JSON.stringify(objectWithGeometry)))
    }
    invariant(typeof parsedGeometry === "object", "parsed Geometry required")
    return parsedGeometry
  }

  const subsection: Subsection = JSON.parse(JSON.stringify(subsectionOrg)) // deep copy
  subsection.geometry = parseGeometry(subsection)
  subsection.subsubsections.forEach((subsubsection) => {
    subsubsection.geometry = parseGeometry(subsubsection)
  })

  const subsubsection =
    subsubsectionSlug && subsection.subsubsections.find((s) => s.slug === subsubsectionSlug)

  return (
    <>
      <MetaTags noindex title={subsection!.title} />

      <Breadcrumb />
      <PageHeader
        title={subsection!.title}
        action={
          <Link
            icon="edit"
            href={Routes.EditSubsectionPage({
              projectSlug: projectSlug!,
              sectionSlug: sectionSlug!,
              subsectionSlug: subsectionSlug!,
            })}
          >
            bearbeiten
          </Link>
        }
      />

      <PageDescription>
        <div className="flex gap-8">
          <Markdown markdown={subsection.description} className="mb-3" />
          <div className="space-y-2">
            <StakeholderSummary stakeholdernotes={stakeholdernotes} />
            <p>
              <strong>Teilstreckenlänge:</strong> TODO
              {/* {subsection.length ? subsection.length + " km" : " k.A."} */}
            </p>
          </div>
        </div>
      </PageDescription>

      <div className="relative mt-12 flex h-96 w-full gap-4 sm:h-[500px]">
        <SubsectionMap
          // Make sure the map rerenders when we close the SubsectionSidebar
          key={`map-${Boolean(subsubsection)}`}
          sections={sections as ProjectMapSections}
          selectedSubsection={subsection}
        />

        {subsubsection ? (
          <SubsubsectionSidebar
            subsubsection={subsubsection}
            onClose={() => {
              void router.push(
                Routes.SubsectionDashboardPage({
                  projectSlug: projectSlug!,
                  sectionSlug: sectionSlug!,
                  subsectionPath: [subsectionSlug!],
                }),
                undefined,
                { scroll: false }
              )
            }}
          />
        ) : null}
      </div>

      <SubsubsectionTable subsubsections={subsection.subsubsections} />

      <StakeholderSection stakeholdernotes={stakeholdernotes} />

      <SuperAdminLogData data={{ subsectionOrg, subsection, sections, stakeholdernotes }} />
    </>
  )
}

const SubsectionDashboardPage: BlitzPage = () => {
  const { subsectionSlug } = useSlugs()
  if (subsectionSlug === undefined) return null

  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <SubsectionDashboardWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

SubsectionDashboardPage.authenticate = true

export default SubsectionDashboardPage
