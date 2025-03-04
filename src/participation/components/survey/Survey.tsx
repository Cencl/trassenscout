import { useCallback, useContext, useState } from "react"
import SurveyForm from "../form/SurveyForm"

export { FORM_ERROR } from "src/core/components/forms"

import { stageProgressDefinition } from "src/participation/components/rs8"
import { ProgressContext } from "src/participation/context/contexts"
import { Survey as TSurvey } from "src/participation/data/types"
import { Debug } from "../Debug"
import { Page } from "./Page"
import { scrollToTopWithDelay } from "src/participation/utils/scrollToTopWithDelay"

type Props = { survey: TSurvey; onSubmit: ([]) => void }

export const Survey: React.FC<Props> = ({ survey, onSubmit }) => {
  const [values, setValues] = useState({})
  const { setProgress } = useContext(ProgressContext)
  const [surveyPageProgress, setSurveyPageProgress] = useState(0)

  const handleNextPage = () => {
    const newSurveyPageProgress = Math.min(survey.pages.length, surveyPageProgress + 1)
    setSurveyPageProgress(newSurveyPageProgress)
    setProgress(stageProgressDefinition["SURVEY"] + newSurveyPageProgress)
    scrollToTopWithDelay()
  }

  const handleBackPage = () => {
    const newSurveyPageProgress = Math.max(0, surveyPageProgress - 1)
    setSurveyPageProgress(newSurveyPageProgress)
    setProgress(stageProgressDefinition["SURVEY"] + newSurveyPageProgress)
    scrollToTopWithDelay()
  }

  const buttonActions = {
    next: handleNextPage,
    back: handleBackPage,
  }

  const { pages } = survey

  const transformValues = (values: Record<string, null | string | boolean>) => {
    const responses: Record<string, null | string | number | number[]> = {}
    Object.entries(values).forEach(([k, v]) => {
      const [questionType, questionId, responseId] = k.split("-")
      switch (questionType) {
        case "single":
          responses[questionId!] = v === null ? null : Number(v)
          break
        case "multi":
          if (!(questionId! in responses)) responses[questionId!] = []
          // @ts-ignore
          if (v) responses[questionId!].push(Number(responseId))
          break
        case "text":
          responses[questionId!] = v === "" ? null : String(v)
          break
      }
    })
    return responses
  }

  const handleSubmit = (values: any) => {
    values = transformValues(values)
    onSubmit(values)
  }
  const handleChange = useCallback((values: any) => {
    values = transformValues(values)
    setValues(values)
  }, [])

  const pageIsComplete = () => {
    let completed: boolean
    const questions = pages[surveyPageProgress]!.questions

    if (!questions || !questions.length) {
      completed = true
    } else {
      // @ts-ignore every() returns a boolean
      completed = pages[surveyPageProgress]!.questions?.every(({ id, component }) => {
        if (!(id in values)) {
          return false
        }
        // @ts-ignore no worries - this works
        const response = values[id]
        if (["singleResponse", "text"].includes(component)) {
          return response !== null
        } else {
          return !!response.length
        }
      })
    }
    return completed
  }
  const completed = pageIsComplete()

  const page = pages[surveyPageProgress]

  return (
    // @ts-ignore
    <SurveyForm onSubmit={handleSubmit} onChangeValues={handleChange}>
      <Debug>
        <code>
          <pre>{JSON.stringify(values, null, 2)}</pre>
        </code>
      </Debug>
      {page && <Page page={page} buttonActions={buttonActions} completed={completed} />}
    </SurveyForm>
  )
}
