import { SurveyResponse } from "@prisma/client"
import clsx from "clsx"
import EditableSurveyResponseItem from "./EditableSurveyResponseItem"
export { FORM_ERROR } from "src/core/components/forms"

const columnWidthClasses = {
  id: "w-20",
  status: "w-48",
  operator: "w-32",
}

type Props = {
  responses: SurveyResponse[]
}

const EditableSurveyResponsesList: React.FC<Props> = ({ responses }) => {
  return (
    <div className="not-prose overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <div className="flex border-b border-gray-100 text-xs uppercase text-gray-500">
        <div className={clsx(columnWidthClasses.id, "pb-2 pl-4 pr-3 pt-3 sm:pl-6 opacity-0")}>
          ID
        </div>
        <div className={clsx(columnWidthClasses.status, "pb-2 pl-4 pr-3 pt-3 sm:pl-6")}>Status</div>
        <div className={clsx(columnWidthClasses.operator, "pb-2 pl-4 pr-3 pt-3 sm:pl-6")}>
          Baulastträger
        </div>
        <div className="flex-grow px-3 pb-2 pt-3"> Kommentare</div>
      </div>

      <div className="flex flex-col">
        {responses.map((response) => (
          <EditableSurveyResponseItem
            columnWidthClasses={columnWidthClasses}
            key={response.id}
            response={response}
          />
        ))}
      </div>
    </div>
  )
}

export default EditableSurveyResponsesList
