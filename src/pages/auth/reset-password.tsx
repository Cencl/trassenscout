import { useEffect, useState } from "react"
import Layout from "src/core/layouts/Layout"
import { LabeledTextField } from "src/core/components/forms/LabeledTextField"
import { Form, FORM_ERROR } from "src/core/components/forms/Form"
import { ResetPassword } from "src/auth/validations"
import resetPassword from "src/auth/mutations/resetPassword"
import { BlitzPage, Routes } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useMutation } from "@blitzjs/rpc"
import Link from "next/link"
import { MetaTags } from "src/core/layouts/MetaTags"
import { FormLayout } from "src/core/components/forms"

const ResetPasswordPage: BlitzPage = () => {
  const [token, setToken] = useState("")
  const router = useRouter()
  const [resetPasswordMutation, { isSuccess }] = useMutation(resetPassword)

  useEffect(() => {
    setToken(router.query.token as string)
  }, [router.isReady])

  return (
    <div>
      {isSuccess ? (
        <div>
          <h2>Password Reset Successfully</h2>
          <p>
            Go to the <Link href={Routes.Home()}>homepage</Link>
          </p>
        </div>
      ) : (
        <Form
          className="space-y-6"
          submitText="Reset Password"
          schema={ResetPassword}
          initialValues={{
            password: "",
            passwordConfirmation: "",
            token,
          }}
          onSubmit={async (values) => {
            try {
              await resetPasswordMutation({ ...values, token })
            } catch (error: any) {
              if (error.name === "ResetPasswordError") {
                return {
                  [FORM_ERROR]: error.message,
                }
              } else {
                return {
                  [FORM_ERROR]: "Sorry, we had an unexpected error. Please try again.",
                }
              }
            }
          }}
        >
          <LabeledTextField name="password" label="New Password" type="password" />
          <LabeledTextField
            name="passwordConfirmation"
            label="Confirm New Password"
            type="password"
          />
        </Form>
      )}
    </div>
  )
}

ResetPasswordPage.redirectAuthenticatedTo = "/"
ResetPasswordPage.getLayout = (page) => (
  <Layout>
    <MetaTags noindex title="Passwort vergessen" />
    <FormLayout title="Neues Passwort vergeben">{page}</FormLayout>
  </Layout>
)

export default ResetPasswordPage
