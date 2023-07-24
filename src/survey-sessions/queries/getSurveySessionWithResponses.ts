import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import db, { SurveySession, SurveyResponse } from "db"

const GetSurveySession = z.object({
  id: z.number(),
})

interface SurveySessionWithResponses extends SurveySession {
  responses: SurveyResponse[]
}

export default resolver.pipe(
  resolver.zod(GetSurveySession),
  resolver.authorize("ADMIN"),
  async ({ id }) => {
    const surveySession = (await db.surveySession.findFirstOrThrow({
      include: {
        responses: true,
      },
      where: { id },
    })) as SurveySessionWithResponses
    return surveySession
  },
)
