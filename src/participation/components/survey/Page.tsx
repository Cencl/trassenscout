import { ScreenHeaderParticipation } from "src/participation/components/core/ScreenHeaderParticipation"
import { ParticipationButton, TParticipationButton } from "../core/ParticipationButton"
import { ParticipationButtonWrapper } from "../core/ParticipationButtonWrapper"
import { Question } from "../Question"
export { FORM_ERROR } from "src/core/components/forms"

export type TButton = {
  label: { de: string }
  color: "white" | "pink"
  onClick: { action: "reset" | "nextPage" | "previousPage" | "submit" }
}

export type TQuestion = {
  id: number
  label: { de: string }
  component: "singleResponse" | "multipleResponse" | "text"
  props: {
    responses: { id: number; text: { de: string } }[] | null
  }
}

export type TPage = {
  id: number
  title: { de: string }
  description: {
    de: string
  }
  questions: TQuestion[] | null
  buttons: TButton[] | null
}

type Props = { page: TPage }

export const Page: React.FC<Props> = ({ page }) => {
  if (!page) return null
  const { title, description, questions, buttons } = page
  return (
    <section>
      <>
        <ScreenHeaderParticipation title={title.de} description={description.de} />
        {questions &&
          questions.length &&
          questions.map((question, index) => (
            // eslint-disable-next-line react/jsx-key
            <Question className="mb-2" key={index} question={question} />
          ))}
        <ParticipationButtonWrapper>
          {buttons?.map((button, index) => (
            <ParticipationButton key={index} button={button} />
          ))}
        </ParticipationButtonWrapper>
      </>
    </section>
  )
}
