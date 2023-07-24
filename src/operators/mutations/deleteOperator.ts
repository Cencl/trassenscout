import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import getOperatorProjectId from "../queries/getOperatorProjectId"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"

const DeleteOperatorSchema = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteOperatorSchema),
  authorizeProjectAdmin(getOperatorProjectId),
  async ({ id }) => await db.operator.deleteMany({ where: { id } }),
)
