import { Callout, Link } from "@/components/ui/phosphor";

export default function NotFound() {
  return (
    <Callout variant="warn" title="404">
      The requested signal is not in the archive. <Link href="/">Return home</Link>.
    </Callout>
  );
}
