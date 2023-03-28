import { zodResolver } from "@hookform/resolvers/zod"
import clsx from "clsx"
import { PropsWithoutRef, ReactNode, useEffect, useState } from "react"
import { FormProvider, useForm, UseFormProps } from "react-hook-form"
import { z } from "zod"
import { FormError } from "./FormError"

export interface FormProps<S extends z.ZodType<any, any>>
  extends Omit<PropsWithoutRef<JSX.IntrinsicElements["form"]>, "onSubmit"> {
  /** All your form fields */
  children?: ReactNode
  /** Text to display in the submit button */
  submitText?: string
  submitClassName?: string
  schema?: S
  onSubmit: (values: z.infer<S>, submitterId?: string) => Promise<void | OnSubmitResult>
  onChangeValues: (values: any) => void
  initialValues?: UseFormProps<z.infer<S>>["defaultValues"]
}

interface OnSubmitResult {
  FORM_ERROR?: string
  [prop: string]: any
}

export const FORM_ERROR = "FORM_ERROR"

export function Form<S extends z.ZodType<any, any>>({
  children,
  submitText,
  submitClassName,
  schema,
  initialValues,
  onSubmit,
  onChangeValues,
  className,
  ...props
}: FormProps<S>) {
  const ctx = useForm<z.infer<S>>({
    mode: "onBlur",
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: initialValues,
  })
  const [formError] = useState<string | null>(null)
  useEffect(() => {
    if (onChangeValues) {
      onChangeValues(ctx.getValues())
    }
  }, [])

  if (onChangeValues) props.onChange = () => onChangeValues(ctx.getValues())

  return (
    <FormProvider {...ctx}>
      <form
        className={clsx("space-y-6", className)}
        onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
          // @ts-ignore
          const submitterId = e.nativeEvent.submitter.id
          await ctx.handleSubmit(async (values) => await onSubmit(values, submitterId))()
          e.preventDefault()
        }}
        {...props}
      >
        {children}
        <FormError formError={formError} />
      </form>
    </FormProvider>
  )
}

export default Form
