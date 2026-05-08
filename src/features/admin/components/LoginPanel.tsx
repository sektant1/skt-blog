"use client";

import { useActionState } from "react";
import { Button, FormField, Input, PdaWindow, Text } from "@/components/ui/phosphor";
import { loginAction } from "../actions/auth";
import styles from "../styles/Admin.module.scss";

export function LoginPanel() {
  const [error, action, pending] = useActionState(loginAction, null);
  return (
    <PdaWindow title="admin login" meta="localhost only">
      <form action={action}>
        <FormField label="Username"><Input name="username" autoComplete="username" /></FormField>
        <FormField label="Password"><Input name="password" type="password" autoComplete="current-password" /></FormField>
        {error ? <Text as="p" variant="body" className={styles.error}>{error}</Text> : null}
        <Button type="submit" disabled={pending}>{pending ? "checking" : "login"}</Button>
      </form>
    </PdaWindow>
  );
}
