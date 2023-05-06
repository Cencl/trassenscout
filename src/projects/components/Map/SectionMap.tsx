import React, { useState } from "react"
import { useRouter } from "next/router"
import { Routes, useParam } from "@blitzjs/next"
import { lineString } from "@turf/helpers"
import { MapLayerMouseEvent, Marker } from "react-map-gl"

import { midPoint, sectionsBbox } from "./utils"
import { BaseMap } from "./BaseMap"
import { SubsectionMarker } from "./Markers"
import { ProjectMapSections } from "./ProjectMap"
import { featureCollection } from "@turf/turf"

type SectionMapProps = {
  children?: React.ReactNode
  sections: ProjectMapSections
  selectedSection: ProjectMapSections[number]
}

const unselectableLineColor = "#979797"
const lineColor = "#EAB308"
const hoveredColor = "#fad57d"

export const SectionMap: React.FC<SectionMapProps> = ({ sections, selectedSection }) => {
  const router = useRouter()
  const projectSlug = useParam("projectSlug", "string")
  const sectionSlug = useParam("sectionSlug", "string")

  const handleSelect = (subsectionSlug: string) =>
    router.push(
      Routes.SubsectionDashboardPage({
        projectSlug: projectSlug!,
        sectionSlug: sectionSlug!,
        subsectionPath: [subsectionSlug],
      })
    )

  const [hovered, setHovered] = useState<number | string | null>(null)
  const getId = (e: MapLayerMouseEvent | undefined) => e?.features?.[0]?.properties?.id || null
  const handleClick = async (e: MapLayerMouseEvent | undefined) =>
    getId(e) && handleSelect(getId(e))
  const handleMouseEnter = (e: MapLayerMouseEvent | undefined) => setHovered(getId(e))
  const handleMouseLeave = () => setHovered(null)

  const sectionBounds = sectionsBbox(selectedSection ? [selectedSection] : sections)
  if (!sectionBounds) return null

  const dots = selectedSection.subsections.map((subsection) => JSON.parse(subsection.geometry)[0])
  dots.push(JSON.parse(selectedSection.subsections.at(-1)!.geometry).at(-1))

  const lines = featureCollection(
    sections
      .filter((section) => section.id !== selectedSection.id)
      .map((section) =>
        section.subsections.map((subsection) =>
          lineString(JSON.parse(subsection.geometry), {
            color: unselectableLineColor,
            opacity: 0.5,
          })
        )
      )
      .flat()
  )

  const selectableLines = featureCollection(
    selectedSection.subsections.map((subsection) =>
      lineString(JSON.parse(subsection.geometry), {
        id: subsection.slug,
        color: subsection.slug === hovered ? hoveredColor : lineColor,
      })
    )
  )

  const markers = selectedSection.subsections.map((subsection, index) => {
    const [longitude, latitude] = midPoint(JSON.parse(subsection.geometry))
    return (
      <Marker
        key={subsection.id}
        longitude={longitude}
        latitude={latitude}
        anchor="center"
        onClick={() => handleSelect(subsection.slug)}
      >
        <SubsectionMarker
          label={`PA${index + 1}`}
          onMouseEnter={() => setHovered(subsection.slug)}
          onMouseLeave={() => setHovered(null)}
        />
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
      lines={lines}
      selectableLines={selectableLines}
      // @ts-ignore
      dots={lineString(dots)}
    >
      {markers}
    </BaseMap>
  )
}
