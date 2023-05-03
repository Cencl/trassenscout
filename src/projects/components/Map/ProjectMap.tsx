import React, { useState } from "react"
import { useRouter } from "next/router"
import { Routes, useParam } from "@blitzjs/next"
import { Section, Subsection } from "@prisma/client"
import { lineString } from "@turf/helpers"
import { along, featureCollection, length } from "@turf/turf"
import { Marker } from "react-map-gl"

import { sectionsBbox } from "./utils"
import { BaseMap } from "./BaseMap"
import { SectionMarker } from "./Markers"

export type ProjectMapSections = (Section & {
  subsections: Pick<Subsection, "id" | "slug" | "geometry">[]
})[]

type ProjectMapProps = {
  children?: React.ReactNode
  sections: ProjectMapSections
  selectedSection?: ProjectMapSections[number]
}

export const ProjectMap: React.FC<ProjectMapProps> = ({ sections, selectedSection }) => {
  const router = useRouter()
  const projectSlug = useParam("projectSlug", "string")

  const [hoveredSectionIds, setHoveredSectionIds] = useState<number[]>([])

  const handleClick = async (e: mapboxgl.MapLayerMouseEvent) => {
    const sectionSlug = e?.features?.[0]?.properties?.sectionSlug
    if (sectionSlug) {
      await router.push(Routes.SectionDashboardPage({ projectSlug: projectSlug!, sectionSlug }))
    }
  }

  const handleMouseEnter = (e: mapboxgl.MapLayerMouseEvent) => {
    setHoveredSectionIds(e.features!.map((f) => f?.properties?.sectionId))
  }

  const handleMouseLeave = () => {
    setHoveredSectionIds([])
  }

  const sectionBounds = sectionsBbox(selectedSection ? [selectedSection] : sections)
  if (!sectionBounds) return null

  // Layer style for segments depending on selected section and segment
  const getLineColor = ({ section }: { section: Section }) => {
    let lineColor = "#979797"
    if (hoveredSectionIds.includes(section.id)) lineColor = "#EAB308"
    if (selectedSection && section.id === selectedSection.id) lineColor = "#EAB308"
    return lineColor
  }

  const dots = sections
    .map((section) => section.subsections.map((subsection) => JSON.parse(subsection.geometry)[0]))
    .flat()
  dots.push(JSON.parse(sections.at(-1)!.subsections.at(-1)!.geometry).at(-1))

  const selectableLines = featureCollection(
    sections
      .map((section) =>
        section.subsections.map((subsection) =>
          lineString(JSON.parse(subsection.geometry), {
            sectionId: section.id,
            sectionSlug: section.slug,
            color: getLineColor({ section }),
          })
        )
      )
      .flat()
  )

  const markers = sections.map((section, index) => {
    const midIndex = Math.floor(section.subsections.length / 2)
    const geometryString = section.subsections?.at(midIndex)?.geometry
    if (!section.subsections.length || !midIndex || !geometryString) {
      return null
    }
    const midLine = lineString(JSON.parse(geometryString))
    const midLengthHalf = length(midLine) / 2
    const midPoint = along(midLine, midLengthHalf)

    return (
      <Marker
        key={section.id}
        longitude={midPoint.geometry.coordinates[0]}
        latitude={midPoint.geometry.coordinates[1]}
        anchor="center"
        onClick={() =>
          router.push(
            Routes.SectionDashboardPage({ projectSlug: projectSlug!, sectionSlug: section.slug })
          )
        }
      >
        <SectionMarker label={`TS${index + 1}`} />
      </Marker>
    )
  })

  return (
    <BaseMap
      id="mainMap"
      initialViewState={{
        bounds: sectionBounds,
        fitBoundsOptions: { padding: 60 },
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      selectableLines={selectableLines}
      // @ts-ignore
      dots={lineString(dots)}
    >
      {markers}
    </BaseMap>
  )
}
