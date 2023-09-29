import { Routes } from "@blitzjs/next"
import React, { useState } from 'react';
import { useMutation } from "@blitzjs/rpc"
import { AuthenticationError, PromiseReturnType } from "blitz"
import login from "src/auth/mutations/login"
import { Login } from "src/auth/validations"
import { DevAdminBox } from "src/core/components/AdminBox"
import { Form, FORM_ERROR } from "src/core/components/forms/Form"
import { LabeledTextField } from "src/core/components/forms/LabeledTextField"
import { blueButtonStyles, Link } from "src/core/components/links"
import clsx from "clsx"
import { ChangeEvent } from 'react';

type LoginFormProps = {
  onSuccess?: (user: PromiseReturnType<typeof login>) => void
}

export const LoginForm = (props: LoginFormProps) => {
  const [isMosesFetchVisible, setIsMosesFetchVisible] = useState(false)
  const [isMosesSendVisible, setIsMosesSendVisible] = useState(false)
  const [MosesCanSendInfo, setMosesCanSendInfo] = useState(false)
  const [currentEmail, setCurrentEmail] = useState("")
  const [mosesSendStatus, setMosesSendStatus] = useState("")
  const [loginMutation] = useMutation(login)

  type HandleSubmit = any // TODO

  type MosesFetchResponse = {
    error: number;
    breached: boolean;
    canSendInfo: boolean;
  };

  type MosesEmailResponse = {
    error: number;
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentEmail(e.target.value)
  }

  const fetchMoses = async () => {
    setIsMosesFetchVisible(false)
    setIsMosesSendVisible(false)

    try {
      const response = await fetch("/moses/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contact: currentEmail,
        }),
      });

      if (response.ok) {
        const data = await response.json() as MosesFetchResponse;

        if (data.error === 0) {
          if (data.breached) {
            setMosesCanSendInfo(data.canSendInfo)
            setIsMosesFetchVisible(true);
          }
        }
      }
    } catch (error) { }
  };

  const sendMoses = async () => {
    setIsMosesFetchVisible(false)

    try {
      const response = await fetch("/moses/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contact: currentEmail,
        }),
      });

      setIsMosesSendVisible(true)

      if (response.ok) {
        const data = await response.json() as MosesEmailResponse;

        if (data.error === 0) {
          setMosesSendStatus("Sie erhalten in kürze eine E-Mail.")
        } else {
          setMosesSendStatus("Fehler beim Versand der E-Mail.")
        }
      } else {
        setMosesSendStatus("Fehler beim Versand der E-Mail.")
      }
    } catch (error) { }
  }

  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const user = await loginMutation(values)
      props.onSuccess?.(user)
    } catch (error: any) {
      if (error instanceof AuthenticationError) {
        return { [FORM_ERROR]: "Diese Anmeldedaten sind ungültig." }
      } else {
        return {
          [FORM_ERROR]: "Ein unerwarteter Fehler ist aufgetreten. - " + error.toString(),
        }
      }
    }
  }

  return (
    <>
      <Form
        submitText="Anmelden"
        schema={Login}
        initialValues={{ email: "", password: "" }}
        onSubmit={handleSubmit}
      >
        <LabeledTextField
          name="email"
          label="E-Mail-Adresse"
          placeholder="name@beispiel.de"
          autoComplete="email"
          onBlur={() => fetchMoses()}
          onChange={ handleEmailChange}
        />
        <LabeledTextField
          name="password"
          label="Passwort"
          placeholder="Passwort"
          type="password"
          autoComplete="current-password"
        />
        <div className="text-sm">
          Sie haben Ihr <Link href={Routes.ForgotPasswordPage()}>Passwort vergessen?</Link>
        </div>

        <DevAdminBox className="text-center">
          {[
            ["admin", "admin@fixmycity.de"],
            ["all-projects", "all-projects@fixmycity.de"],
            ["no-project", "no-project@fixmycity.de"],
            ["rs23", "rs23@fixmycity.de"],
            ["rs3000", "rs3000@fixmycity.de"],
          ].map(([displayName, email]) => (
            <button
              key={displayName}
              className={clsx(blueButtonStyles, "m-1")}
              onClick={async () =>
                await handleSubmit({
                  email,
                  password: "dev-team@fixmycity.de",
                })
              }
            >
              {displayName}
            </button>
          ))}
        </DevAdminBox>

      {isMosesFetchVisible && (
        <div style={{
          padding: "10px",
          color: "#eee",
          backgroundColor: "#7a0000",
          borderRadius: "10px"
        }}>
          Ihre Daten waren offenbar von einem Datenleck betroffen.
          {MosesCanSendInfo ? (
            <button className={clsx(blueButtonStyles, "m-1")}
              type="button"
              onClick={() => sendMoses()}
            >
              Senden Sie mir eine Nachricht mit weiteren Informationen
            </button>
          ) : (
            <div>Eine E-Mail mit den betroffenen Datensätzen wurde Ihnen bereits kürzlich zugesendet.</div>
          )}
        </div>
      )}

      {isMosesSendVisible && (
        <div style={{
          padding: "10px",
          color: "#000",
          backgroundColor: "#f7f0a3",
          borderRadius: "10px"
        }}>
            <div>{mosesSendStatus}</div>
        </div>
      )}
      </Form>

      <div className="mt-4 text-sm">
        Sie haben noch keinen Account? Zur <Link href={Routes.SignupPage()}>Registrierung</Link>.
      </div>
    </>
  )
}

export default LoginForm