import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySlug from "../../projects/queries/getProjectIdBySlug"

type GetFilesInput = { projectSlug: string } & Pick<
  Prisma.FileFindManyArgs,
  "where" | "orderBy" | "skip" | "take"
>

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectAdmin(getProjectIdBySlug),
  async ({ projectSlug, where, orderBy = { id: "asc" }, skip = 0, take = 100 }: GetFilesInput) => {
    const safeWhere = { project: { slug: projectSlug }, ...where }

    const {
      items: files,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.file.count({ where: safeWhere }),
      query: (paginateArgs) =>
        db.file.findMany({
          ...paginateArgs,
          where: safeWhere,
          orderBy,
          include: {
            subsection: { select: { id: true, slug: true, start: true, end: true } },
          },
        }),
    })

    return {
      files,
      nextPage,
      hasMore,
      count,
    }
  },
)
