import React, { useEffect, useState } from "react"
import { LabeledRadiobuttonGroup, LabeledSelect } from "src/core/components/forms"
import { LabeledGeometryField } from "src/core/components/forms/LabeledGeometryField"
import { GeometryInputMap } from "./GeometryInputMap"
import { useFormContext } from "react-hook-form"
import { useQuery } from "@blitzjs/rpc"
import getSubsection from "src/subsections/queries/getSubsection"
import { useSlugs } from "src/core/hooks"
import { midPoint } from "src/core/components/Map/utils"
import { z } from "zod"

export const GeometryInput: React.FC = () => {
  const { projectSlug, subsectionSlug } = useSlugs()
  const [subsection] = useQuery(getSubsection, {
    projectSlug: projectSlug!,
    subsectionSlug: subsectionSlug!,
  })

  const { setValue, watch } = useFormContext()
  const geometry = watch("geometry")
  const type = watch("type")

  const LineStringSchema = z.array(z.array(z.number()).min(2).max(2).nonempty()).nonempty()
  const PointSchema = z.array(z.number()).min(2).max(2).nonempty()
  const schemaResult =
    type === "ROUTE" ? LineStringSchema.safeParse(geometry) : PointSchema.safeParse(geometry)

  useEffect(() => {
    const invalidGeometry = !schemaResult.success
    if (invalidGeometry) {
      type === "ROUTE"
        ? setValue("geometry", subsection.geometry)
        : setValue("geometry", midPoint(subsection.geometry))
    }
  }, [schemaResult.success, setValue, subsection.geometry, type])

  return (
    <>
      <LabeledRadiobuttonGroup
        label="Führungsform"
        scope="type"
        items={[
          { value: "ROUTE", label: "Regelführung (RF) – Linie" },
          { value: "AREA", label: "Sonderführung (SF) – Punkt" },
        ]}
        classNameItemWrapper="flex gap-5 !space-y-0 items-center"
      />

      {schemaResult.success && <GeometryInputMap subsection={subsection} />}

      <details className="open:border border-gray-300 p-4 rounded open:bg-gray-50">
        <summary className="cursor-pointer mb-4 text-sm font-medium text-gray-700">
          Geometrie
        </summary>

        <LabeledGeometryField
          name="geometry"
          label="Geometry der Achse (`LineString` oder `Point`)"
        />
      </details>
    </>
  )
}
