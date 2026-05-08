"use client";

import NextLink from "next/link";
import { useActionState } from "react";
import {
  Button,
  FormField,
  Input,
  PdaWindow,
  Text,
} from "@/components/ui/phosphor";
import { registerAction } from "../actions/auth";
import styles from "../styles/Admin.module.scss";

export function RegisterPanel() {
  const [error, action, pending] = useActionState(registerAction, null);

  return (
    <PdaWindow title="admin register" meta="localhost only">
      <form action={action} className={styles.stack}>
        <Text as="p" variant="body">
          Create a local admin account. The first account can always be created
          on localhost. More accounts require ADMIN_REGISTRATION_ENABLED=true.
        </Text>

        <FormField label="Username">
          <Input name="username" autoComplete="username" required />
        </FormField>

        <FormField label="Password">
          <Input
            name="password"
            type="password"
            autoComplete="new-password"
            required
          />
        </FormField>

        <FormField label="Confirm password">
          <Input
            name="passwordConfirm"
            type="password"
            autoComplete="new-password"
            required
          />
        </FormField>

        {error ? (
          <Text as="p" variant="body" className={styles.error}>
            {error}
          </Text>
        ) : null}

        <div className={styles.actions}>
          <Button type="submit" disabled={pending}>
            {pending ? "creating" : "register"}
          </Button>

          <Button
            variant="ghost"
            href="/admin/login"
            className={styles.secondaryAction}
          >
            login instead
          </Button>
        </div>
      </form>
    </PdaWindow>
  );
}
