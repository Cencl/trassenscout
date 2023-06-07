import { useCallback, useState } from "react"
import { Response } from "../data/types"
import { ParticipationButton } from "./core/buttons/ParticipationButton"
import { ScreenHeaderParticipation } from "./layout/ScreenHeaderParticipation"
import { ParticipationH2 } from "./core/Text"
import { ParticipationLabeledRadiobuttonGroup } from "./form/ParticipationLabeledRadiobuttonGroup"
import SurveyForm from "./form/SurveyForm"
import { ParticipationButtonWrapper } from "./core/buttons/ParticipationButtonWrapper"

export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  onClickMore: any
  onClickFinish: any
  more: any // TODO
}

export const More: React.FC<Props> = ({ more, onClickMore, onClickFinish }) => {
  // It would be much nicer to useFormContext and formState.isDirty - but then this component has to be wrapped in Form (and FormProvider - tbd)
  const [isDirty, setIsDirty] = useState(false)
  const [isFeedback, setIsFeedback] = useState(false)

  const { title, description, questions, buttons } = more.pages[0]
  const question = questions[0]
  const button = buttons[0]

  const handleChange = useCallback(
    (values: Record<string, any>) => {
      setIsFeedback(Number(values.feedback) === question.props.responses[0].id)
      setIsDirty(
        Number(values.feedback) === question.props.responses[0].id ||
          Number(values.feedback) === question.props.responses[1].id
      )
    },
    [question.props.responses]
  )

  return (
    <SurveyForm onSubmit={onClickFinish} onChangeValues={handleChange}>
      <ScreenHeaderParticipation title={title.de} description={description.de} />
      <ParticipationH2>{question.label.de}</ParticipationH2>
      <ParticipationLabeledRadiobuttonGroup
        items={question.props.responses.map((item: Response) => ({
          scope: "feedback",
          name: String(item.id),
          label: item.text.de,
          value: item.id,
        }))}
      />
      <ParticipationButtonWrapper>
        <ParticipationButton disabled={!isDirty} onClick={isFeedback ? onClickMore : onClickFinish}>
          {button.label.de}
        </ParticipationButton>
      </ParticipationButtonWrapper>
    </SurveyForm>
  )
}
