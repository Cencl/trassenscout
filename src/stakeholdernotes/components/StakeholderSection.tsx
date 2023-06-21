import { Routes, useRouterQuery } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import React from "react"
import { Link } from "src/core/components/links"
import { ButtonWrapper } from "src/core/components/links/ButtonWrapper"
import { H2 } from "src/core/components/text/Headings"
import { ZeroCase } from "src/core/components/text/ZeroCase"
import { useSlugs } from "src/core/hooks"
import getStakeholdernotes from "../queries/getStakeholdernotes"
import StakeholdernoteList from "./StakeholderSectionList"
import { StakeholdernoteFilterDropdown } from "./StakeholdernoteFilterDropdown"
import { stakeholderNoteLabel, stakeholderNotesStatus } from "./stakeholdernotesStatus"
import { quote } from "src/core/components/text"

type Props = {
  subsectionId: number
}

export const StakeholderSection: React.FC<Props> = ({ subsectionId }) => {
  const params = useRouterQuery()
  const { projectSlug, subsectionSlug } = useSlugs()
  const [{ stakeholdernotes }] = useQuery(getStakeholdernotes, { subsectionId })

  const filteredStakeholdernotes = params.stakeholderFilter
    ? stakeholdernotes.filter((s) => s.status === params.stakeholderFilter)
    : stakeholdernotes

  const statusLabel = stakeholderNoteLabel(params.stakeholderFilter)

  return (
    <section className="mt-12">
      <div className="mb-5 flex items-center justify-between">
        <H2>
          Abstimmung mit <abbr title="Träger öffentlicher Belange"> TÖB</abbr>s
          {statusLabel && ` – Status ${quote(statusLabel)}`}
        </H2>
        <StakeholdernoteFilterDropdown stakeholdernotes={stakeholdernotes} />
      </div>

      <ZeroCase visible={filteredStakeholdernotes.length} name="TÖBs" />

      <StakeholdernoteList stakeholdernotes={filteredStakeholdernotes} />
      <ButtonWrapper className="mt-5">
        <Link
          button="blue"
          icon="plus"
          href={Routes.NewStakeholdernotesPage({
            projectSlug: projectSlug!,
            subsectionSlug: subsectionSlug!,
          })}
        >
          TÖBs
        </Link>
      </ButtonWrapper>
    </section>
  )
}
