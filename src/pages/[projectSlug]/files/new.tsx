import { Routes, useParam } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import createFile from "src/files/mutations/createFile"
import { FileForm, FORM_ERROR } from "src/files/components/FileForm"
import { Link } from "src/core/components/links"
import { Suspense } from "react"
import { FileSchema } from "src/files/schema"
import getProject from "src/projects/queries/getProject"

const NewFile = () => {
  const router = useRouter()
  const [createFileMutation] = useMutation(createFile)
  const projectSlug = useParam("projectSlug", "string")
  const sectionSlug = useParam("sectionSlug", "string")
  const [project] = useQuery(getProject, { slug: projectSlug! })

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const file = await createFileMutation({ ...values, projectId: project.id })
      await router.push(
        Routes.ShowFilePage({
          projectSlug: projectSlug!,
          sectionSlug: sectionSlug!,
          fileId: file.id,
        })
      )
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <>
      <MetaTags noindex title="Neuen File erstellen" />

      <h1>Neuen File erstellen</h1>

      <FileForm
        submitText="Erstellen"
        // TODO schema: See `__ModelIdParam__/edit.tsx` for detailed instruction.
        schema={FileSchema.omit({ projectId: true })}
        // initialValues={{}} // Use only when custom initial values are needed
        onSubmit={handleSubmit}
      />
    </>
  )
}

const NewFilePage = () => {
  return (
    <LayoutArticle>
      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <NewFile />
      </Suspense>
    </LayoutArticle>
  )
}

NewFilePage.authenticate = true

export default NewFilePage
