import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySurveyResponse from "../queries/getProjectIdBySurveyResponse"
import { SurveyResponseSchema } from "../schema"

const UpdateSurveyResponseSchema = SurveyResponseSchema.merge(
  z.object({
    id: z.number(),
  }),
).omit({
  // We do not want to update this data, it should stay as is
  data: true,
  surveySessionId: true,
  surveyId: true,
})

export default resolver.pipe(
  resolver.zod(UpdateSurveyResponseSchema),
  authorizeProjectAdmin(getProjectIdBySurveyResponse),
  async ({ id, ...data }) =>
    await db.surveyResponse.update({
      where: { id },
      data,
    }),
)
